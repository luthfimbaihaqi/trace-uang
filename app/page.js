"use client"
import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
// Update Import Icon: Tambah Loader2 untuk loading screen
import { Wallet, Utensils, Sparkles, Bus, Ticket, Home, Package, History, Trash2, Settings, Calculator, Loader2 } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import SettingsModal from '../components/SettingsModal';
import InfoModal from '../components/InfoModal'; 
import DeleteModal from '../components/DeleteModal';
import CalculatorModal from '../components/CalculatorModal';

export default function HomePage() {
  // Ambil isLoading dan saveSettings dari Context baru
  const { 
    totalBudget, fixedExpenses, currentBalance, idealBalance, netBudget, totalFixed, status, 
    addExpense, monthlyExpenses, deleteExpense, resetData, 
    isLoading, saveSettings // <--- Tambahan dari Context Supabase
  } = useBudget();
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const formatRp = (num) => "Rp " + num.toLocaleString("id-ID");

  const getMoodConfig = (status) => {
    switch(status) {
      case "KAYA": return { bg: "bg-green-200", text: "Uang Mimi Masih Banyak! 🤑", desc: "Masih aman nih buat jajan", img: "/moods/kaya.png" };
      case "AMAN": return { bg: "bg-blue-200", text: "Aman kok 😎", desc: "Masih on track, pertahankan!", img: "/moods/aman.png" };
      case "PANTAU": return { bg: "bg-yellow-200", text: "Hmmmmmm 😐", desc: "Hati-hati ya, jangan boros.", img: "/moods/pantau.png" };
      case "PANIK": return { bg: "bg-orange-300", text: "Noooo Mimi! 😱", desc: "Jangan banyak jajan, Sayang", img: "/moods/panik.png" };
      case "JEBOL": return { bg: "bg-red-300", text: "Uang Mimi Abiiiis! 😭", desc: "Kamu beli apa aja sayang??", img: "/moods/jebol.png" };
      default: return { bg: "bg-gray-200", text: "Loading...", img: "" };
    }
  };

  const mood = getMoodConfig(status);

  // --- MENU GRID (Teks Tetap) ---
  const menus = [
    { name: "Makan", icon: <Utensils size={24}/>, color: "bg-orange-200" }, 
    { name: "Skincare", icon: <Sparkles size={24}/>, color: "bg-pink-200" }, 
    { name: "Transport", icon: <Bus size={24}/>, color: "bg-blue-200" }, 
    { name: "Entertainment", icon: <Ticket size={24}/>, color: "bg-purple-200" }, 
    { name: "Operasional Kost", icon: <Home size={24}/>, color: "bg-green-200" }, 
    { name: "Online Shopping", icon: <Package size={24}/>, color: "bg-gray-200" }, 
  ];

  const handleSaveExpense = (data) => {
    addExpense(data);
    setActiveCategory(null);
  };

  const handleClickDelete = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteExpense(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleIdealHelp = () => {
    setIsInfoOpen(true);
  };

  // UPDATE: Panggil saveSettings (Supabase) bukan set state manual
  const handleSaveSettings = (newBudget, newFixed) => {
    saveSettings(newBudget, newFixed);
  };

  const groupExpensesByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const dateObj = new Date(item.date);
      const dateKey = dateObj.toLocaleDateString('id-ID'); 
      const today = new Date().toLocaleDateString('id-ID');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('id-ID');

      let label = dateKey;
      if (dateKey === today) label = "Hari Ini";
      else if (dateKey === yesterdayStr) label = "Kemarin";
      else {
        label = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  };

  // TAMPILAN LOADING (Wajib ada karena ambil data dari internet)
  if (!mounted || isLoading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-50 gap-4">
            <Loader2 size={48} className="animate-spin text-black" />
            <p className="font-bold animate-pulse text-sm">Lagi ngambil catatan Mimi...</p>
        </div>
    );
  }

  const groupedExpenses = groupExpensesByDate(monthlyExpenses);

  return (
    <div className="p-6 space-y-6 pb-24">
      
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black border-b-4 border-black inline-block leading-[0.8]">
            Hai, Mimi!
          </h1>
          <p className="text-sm font-medium mt-1 text-gray-600">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => setIsCalculatorOpen(true)} 
                className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
                <Calculator size={20} />
            </button>

            <button 
                onClick={() => setIsSettingsOpen(true)} 
                className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
                <Settings size={20} />
            </button>
        </div>
      </header>

      {/* Mood Board */}
      <div className={`border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${mood.bg} flex items-center gap-4 transition-all`}>
        <img src={mood.img} alt="Mood" className="w-24 h-24 bg-white border-2 border-black rounded-full object-cover" />
        <div>
          <h2 className="text-xl font-black">{mood.text}</h2>
          <p className="text-sm font-medium leading-tight">{mood.desc}</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Sisa Uang Mimi</p>
        <h3 className={`text-4xl font-black tracking-tighter ${currentBalance < 0 ? 'text-red-500' : 'text-black'}`}>
          {formatRp(currentBalance)}
        </h3>
        <div className="mt-4 flex justify-center gap-2">
           <button 
             onClick={handleIdealHelp}
             className="text-xs font-bold bg-gray-100 px-2 py-1 border border-black rounded hover:bg-yellow-200 active:scale-95 transition-all cursor-help"
           >
             Idealnya Sisa: {formatRp(idealBalance)} <span className="text-gray-400 ml-1">?</span>
           </button>
        </div>
      </div>

      {/* Menu Grid */}
      <div>
        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Wallet size={20}/> Mau Catat Apa?
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {menus.map((menu, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(menu)}
              className={`${menu.color} border-2 border-black rounded-xl p-3 flex flex-col items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all h-24 justify-center`}
            >
              {menu.icon}
              <span className="text-xs font-bold">{menu.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Riwayat Pengeluaran */}
      <div>
        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
          <History size={20}/> Riwayat Bulan Ini
        </h4>
        
        {monthlyExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400 font-medium border-2 border-dashed border-gray-300 rounded-xl">
            Belum ada jajan bulan ini. <br/> Hemat banget! 👍
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedExpenses).map((dateLabel) => (
              <div key={dateLabel}>
                <h5 className="font-bold text-sm text-gray-500 mb-2 ml-1 uppercase tracking-wider">
                  {dateLabel}
                </h5>
                <div className="space-y-3">
                  {groupedExpenses[dateLabel].map((item) => (
                    <div key={item.id} className="bg-white border-2 border-black p-3 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.category}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.note || 'Tanpa catatan'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-black text-red-500 text-sm">-{formatRp(item.amount)}</p>
                          <p className="text-[10px] font-bold text-gray-400">
                            {new Date(item.date).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleClickDelete(item)}
                          className="w-8 h-8 bg-red-200 border-2 border-black rounded flex items-center justify-center hover:bg-red-300 active:scale-90 transition-transform"
                          aria-label="Hapus"
                        >
                          <Trash2 size={16} className="text-black" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      <ExpenseModal 
        isOpen={!!activeCategory}
        onClose={() => setActiveCategory(null)}
        category={activeCategory || {}} 
        onSave={handleSaveExpense}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentBudget={totalBudget}
        currentFixed={fixedExpenses} 
        onSave={handleSaveSettings}
        onReset={resetData}
      />

      <InfoModal 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        totalBudget={netBudget}
        totalFixed={totalFixed}
      />

      <DeleteModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        item={itemToDelete || {}}
      />

      <CalculatorModal 
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        netBudget={netBudget} 
      />

    </div>
  );
}