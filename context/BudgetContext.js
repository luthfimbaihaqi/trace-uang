"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [incomeSources, setIncomeSources] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyTarget, setMonthlyTarget] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. CEK USER & LOAD DATA
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      fetchData(session.user.id);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login');
      else {
        setUser(session.user);
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // 2. AMBIL DATA DARI SUPABASE
  const fetchData = async (userId) => {
    setIsLoading(true);
    try {
      // A. Income Sources
      const { data: incData } = await supabase
        .from('income_sources')
        .select('*');
      if (incData) setIncomeSources(incData);

      // B. Expenses
      const { data: expData } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (expData) setExpenses(expData);

      // C. Fixed Expenses
      const { data: fixData } = await supabase
        .from('fixed_expenses')
        .select('*');
      if (fixData) setFixedExpenses(fixData);

      // D. Settings
      const { data: settData } = await supabase
        .from('user_settings')
        .select('monthly_target')
        .single();
      if (settData) setMonthlyTarget(settData.monthly_target || 0);
      else setMonthlyTarget(0);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- PERHITUNGAN ---
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Total pemasukan dari semua sumber
  const totalBudget = incomeSources.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = fixedExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netBudget = totalBudget - totalFixed; // Uang jajan bersih

  // Filter pengeluaran bulan ini
  const monthlyExpenses = expenses.filter(item => {
    const d = new Date(item.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const currentBalance = netBudget - totalSpent;
  const remainingDays = daysInMonth - currentDay + 1;

  // Ideal balance (prorated sisa hari)
  const safeNetBudget = netBudget || 0;
  const idealBalance = Math.round(safeNetBudget * (remainingDays / daysInMonth));

  // Category breakdown
  const categoryBreakdown = (() => {
    const grouped = {};
    monthlyExpenses.forEach(e => {
      grouped[e.category] = (grouped[e.category] || 0) + e.amount;
    });
    return Object.entries(grouped)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent ? Math.round((amount / totalSpent) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  })();

  // Mood system
  const diff = currentBalance - idealBalance;
  let status = "AMAN";
  if (totalBudget === 0) status = "SETUP";
  else if (currentBalance < 0) status = "JEBOL";
  else if (diff > 200000) status = "KAYA";
  else if (diff >= 0) status = "AMAN";
  else if (diff > -500000) status = "PANTAU";
  else status = "PANIK";

  // --- ACTIONS ---

  // Tambah Pengeluaran
  const addExpense = async (newExpense) => {
    if (!user) return;
    
    const tempId = Date.now();
    const optimistic = { ...newExpense, id: tempId, user_id: user.id };
    setExpenses([optimistic, ...expenses]);

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
      alert("Gagal simpan: " + error.message);
      setExpenses(prev => prev.filter(e => e.id !== tempId));
    } else {
      setExpenses(prev => prev.map(e => e.id === tempId ? data : e));
    }
  };

  // Hapus Pengeluaran
  const deleteExpense = async (id) => {
    const backup = [...expenses];
    setExpenses(expenses.filter(e => e.id !== id));

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Gagal hapus: " + error.message);
      setExpenses(backup);
    }
  };

  // Save Settings (Income + Fixed + Target)
  const saveSettings = async (newIncome, newFixed, newTarget) => {
    if (!user) return;

    // 1. Income Sources: hapus semua, tulis ulang
    await supabase.from('income_sources').delete().eq('user_id', user.id);
    if (newIncome.length > 0) {
      const formatted = newIncome.map(i => ({
        user_id: user.id,
        name: i.name,
        amount: i.amount
      }));
      const { data, error } = await supabase
        .from('income_sources')
        .insert(formatted)
        .select();
      if (!error && data) setIncomeSources(data);
    } else {
      setIncomeSources([]);
    }

    // 2. Fixed Expenses: hapus semua, tulis ulang
    await supabase.from('fixed_expenses').delete().eq('user_id', user.id);
    if (newFixed.length > 0) {
      const formatted = newFixed.map(i => ({
        user_id: user.id,
        name: i.name,
        amount: i.amount
      }));
      const { data, error } = await supabase
        .from('fixed_expenses')
        .insert(formatted)
        .select();
      if (!error && data) setFixedExpenses(data);
    } else {
      setFixedExpenses([]);
    }

    // 3. Monthly Target
    const { error: targetError } = await supabase
      .from('user_settings')
      .upsert({ user_id: user.id, monthly_target: newTarget || 0 });
    
    if (!targetError) setMonthlyTarget(newTarget || 0);
  };

  // Reset Data
  const resetData = async () => {
    if (!confirm("Yakin mau hapus SEMUA data (History, Tagihan, Pemasukan)?")) return;
    
    await supabase.from('expenses').delete().eq('user_id', user.id);
    await supabase.from('fixed_expenses').delete().eq('user_id', user.id);
    await supabase.from('income_sources').delete().eq('user_id', user.id);
    
    setExpenses([]);
    setFixedExpenses([]);
    setIncomeSources([]);
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <BudgetContext.Provider value={{ 
      user, isLoading,
      totalBudget, netBudget, totalFixed,
      incomeSources, fixedExpenses,
      expenses, monthlyExpenses,
      totalSpent, currentBalance, idealBalance,
      categoryBreakdown, monthlyTarget,
      status,
      addExpense, deleteExpense,
      saveSettings, resetData, logout
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);