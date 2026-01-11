"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Import Supabase Client
import { useRouter } from 'next/navigation';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null); // Data User yang Login
  const [totalBudget, setTotalBudget] = useState(0); 
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading awal

  // 1. CEK USER & LOAD DATA
  useEffect(() => {
    const checkUser = async () => {
      // Ambil session user saat ini
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Kalau gak ada user login, tendang ke halaman login
        router.push('/login');
        return;
      }

      setUser(session.user);
      fetchData(session.user.id);
    };

    checkUser();

    // Listener kalau user tiba-tiba logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      else setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 2. FUNGSI AMBIL DATA DARI SUPABASE
  const fetchData = async (userId) => {
    setIsLoading(true);
    try {
      // A. Ambil Expenses
      const { data: expData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false }); // Urutkan dari yang terbaru
      
      if (expData) setExpenses(expData);

      // B. Ambil Fixed Expenses
      const { data: fixData } = await supabase
        .from('fixed_expenses')
        .select('*');
      
      if (fixData) setFixedExpenses(fixData);

      // C. Ambil User Settings (Budget)
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('total_budget')
        .single();
      
      // Default 3jt kalau belum di-set
      if (settingsData) setTotalBudget(settingsData.total_budget);
      else setTotalBudget(3000000);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC PERHITUNGAN (SAMA SEPERTI SEBELUMNYA) ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Filter Client-Side untuk Tampilan Dashboard (Bulan Ini)
  const monthlyExpenses = expenses.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = totalBudget - totalSpent;
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netBudget = totalBudget - totalFixed;
  const remainingDays = daysInMonth - currentDay + 1;
  
  // Cegah error NaN
  const safeNetBudget = netBudget || 0;
  const idealBalance = Math.round((safeNetBudget * (remainingDays / daysInMonth)) + totalFixed);

  const diff = currentBalance - idealBalance;
  let status = "AMAN";
  if (currentBalance < 0) status = "JEBOL";
  else if (diff > 200000) status = "KAYA";
  else if (diff >= 0) status = "AMAN";
  else if (diff > -500000) status = "PANTAU";
  else status = "PANIK";

  // --- ACTIONS (CRUD KE SUPABASE) ---

  // A. Tambah Pengeluaran
  const addExpense = async (newExpense) => {
    if (!user) return;
    
    // Optimistic Update (Biar UI cepet)
    const tempId = Date.now();
    const optimisticExpense = { ...newExpense, id: tempId, user_id: user.id };
    setExpenses([optimisticExpense, ...expenses]);

    // Kirim ke Server
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ 
        user_id: user.id,
        category: newExpense.category,
        amount: newExpense.amount,
        note: newExpense.note,
        date: newExpense.date 
      }])
      .select()
      .single();

    if (error) {
      alert("Gagal simpan data: " + error.message);
      // Rollback kalau gagal (hapus yg temp tadi)
      setExpenses(prev => prev.filter(e => e.id !== tempId));
    } else {
      // Replace ID sementara dengan ID asli dari Supabase
      setExpenses(prev => prev.map(e => e.id === tempId ? data : e));
    }
  };

  // B. Hapus Pengeluaran
  const deleteExpense = async (id) => {
    // Optimistic Update
    const backup = [...expenses];
    setExpenses(expenses.filter(e => e.id !== id));

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Gagal hapus: " + error.message);
      setExpenses(backup); // Balikin data
    }
  };

  // C. Save Settings (Budget & Fixed)
  const saveSettings = async (newBudget, newFixedList) => {
    if (!user) return;
    
    // 1. Update Budget (Upsert: Update kalau ada, Insert kalau belum)
    const { error: budgetError } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, total_budget: newBudget });

    if (budgetError) {
      alert("Gagal update budget");
      return;
    }
    setTotalBudget(newBudget);

    // 2. Update Fixed Expenses (Strategi: Hapus Semua -> Tulis Ulang)
    // Ini cara paling gampang untuk sinkronisasi list
    
    // a. Hapus yg lama
    await supabase.from('fixed_expenses').delete().eq('user_id', user.id);
    
    // b. Insert yg baru (kalau ada)
    if (newFixedList.length > 0) {
        const formattedFixed = newFixedList.map(item => ({
            user_id: user.id,
            name: item.name,
            amount: item.amount
        }));
        
        const { data, error: fixedError } = await supabase
            .from('fixed_expenses')
            .insert(formattedFixed)
            .select();
            
        if (!fixedError) setFixedExpenses(data);
    } else {
        setFixedExpenses([]);
    }
  };

  // D. Reset Data / Logout
  const resetData = async () => {
    if (!confirm("Ini akan menghapus SELURUH history belanja kamu selamanya di server. Yakin?")) return;
    
    await supabase.from('expenses').delete().eq('user_id', user.id);
    await supabase.from('fixed_expenses').delete().eq('user_id', user.id);
    // Budget gak usah direset biar gak repot setting ulang
    
    setExpenses([]);
    setFixedExpenses([]);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <BudgetContext.Provider value={{ 
      user,
      isLoading,
      totalBudget, 
      fixedExpenses,
      expenses,        
      monthlyExpenses, 
      totalSpent, 
      currentBalance, 
      idealBalance,
      netBudget,
      totalFixed,
      status,
      // Function yg di-export disesuaikan nama barunya
      setTotalBudget: (val) => setTotalBudget(val), // Placeholder, aslinya pakai saveSettings
      setFixedExpenses: (val) => setFixedExpenses(val), // Placeholder
      saveSettings, // <--- FUNGSI UTAMA BARU BUAT SETTINGS
      addExpense,
      deleteExpense,
      resetData,
      logout // <--- Tambahan Logout
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);