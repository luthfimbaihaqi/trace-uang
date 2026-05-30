"use client"
import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Wallet, Utensils, Sparkles, Bus, Ticket, Home, Package, History, Trash2, Settings, Loader2, TrendingDown, Receipt, Target, ArrowRight } from 'lucide-react';
import ExpenseModal from '../components/ExpenseModal';
import SettingsModal from '../components/SettingsModal';
import DeleteModal from '../components/DeleteModal';

export default function HomePage() {
  const { 
    totalBudget, netBudget, totalFixed,
    incomeSources, fixedExpenses,
    currentBalance, totalSpent,
    categoryBreakdown, monthlyTarget,
    status,
    addExpense, monthlyExpenses, deleteExpense, resetData,
    isLoading, saveSettings, logout
  } = useBudget();
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [toast, setToast] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const formatRp = (num) => "Rp " + num.toLocaleString("id-ID");

  const getMoodConfig = (status) => {
    switch(status) {
      case "KAYA": return { bg: "bg-green-200", text: "Uang Mimi Masih Banyak! 🤑", desc: "Masih aman nih buat jajan", img: "/moods/kaya.png" };
      case "AMAN": return { bg: "bg-blue-200", text: "Aman kok 😎", desc: "Masih on track, pertahankan!", img: "/moods/aman.png" };
      case "PANTAU": return { bg: "bg-yellow-200", text: "Hmmmmmm 😐", desc: "Hati-hati ya, jangan boros.", img: "/moods/pantau.png" };
      case "PANIK": return { bg: "bg-orange-300", text: "Noooo Mimi! 😱", desc: "Jangan banyak jajan, Mimiii", img: "/moods/panik.png" };
      case "JEBOL": return { bg: "bg-red-300", text: "Uang Mimi Abiiiis! 😭", desc: "Kamu beli apa aja Mimiiiii??", img: "/moods/jebol.png" };
      case "SETUP": return { bg: "bg-gray-200", text: "Hai Mimi! 👋", desc: "Atur pemasukan mimi dulu ya", img: "/moods/aman.png" };
      default: return { bg: "bg-gray-200", text: "Loading...", img: "" };
    }
  };

  const mood = getMoodConfig(status);

  const menus = [
    { name: "Makan", icon: <Utensils size={24}/>, color: "bg-orange-200" }, 
    { name: "Skincare", icon: <Sparkles size={24}/>, color: "bg-pink-200" }, 
    { name: "Transport", icon: <Bus size={24}/>, color: "bg-blue-200" }, 
    { name: "Entertainment", icon: <Ticket size={24}/>, color: "bg-purple-200" }, 
    { name: "Operasional Kost", icon: <Home size={24}/>, color: "bg-green-200" }, 
    { name: "Online Shopping", icon: <Package size={24}/>, color: "bg-gray-200" }, 
  ];

  const getCategoryColor = (cat) => {
    const map = {
      "Makan": "bg-orange-300",
      "Skincare": "bg-pink-300",
      "Transport": "bg-blue-300",
      "Entertainment": "bg-purple-300",
      "Operasional Kost": "bg-green-300",
      "Online Shopping": "bg-gray-300",
    };
    return map[cat] || "bg-gray-300";
  };

  const handleSaveExpense = (data) => {
    addExpense(data);
    setActiveCategory(null);
    setToast("Tersimpan! ✅");
    setTimeout(() => setToast(null), 2000);
  };

  const handleClickDelete = (item) => {
    setItemToDelete(item);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteExpense(itemToDelete.id);
      setItemToDelete(null);
      setToast("Dihapus! 🗑️");
      setTimeout(() => setToast(null), 2000);
    }
  };

  const handleSaveSettings = (newIncome, newFixed, newTarget) => {
    saveSettings(newIncome, newFixed, newTarget);
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

  // LOADING SCREEN
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
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Mood Board */}
      <div className={`border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${mood.bg} flex items-center gap-4 transition-all`}>
        <img src={mood.img} alt="Mood" className="w-24 h-24 bg-white border-2 border-black rounded-full object-cover" />
        <div>
          <h2 className="text-xl font-black">{mood.text}</h2>
          <p className="text-sm font-medium leading-tight">{mood.desc}</p>
          {status === "SETUP" && (
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="mt-2 text-xs font-bold bg-black text-white px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
            >
              Setup Sekarang <ArrowRight size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Sisa Uang Jajan</p>
        <h3 className={`text-4xl font-black tracking-tighter ${currentBalance < 0 ? 'text-red-500' : 'text-black'}`}>
          {formatRp(currentBalance)}
        </h3>
        <p className="text-xs text-gray-400 font-medium mt-1">
          dari {formatRp(netBudget)} (setelah tagihan)
        </p>
      </div>

      {/* Target Progress */}
      {monthlyTarget > 0 && (
        <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold uppercase flex items-center gap-1.5">
              <Target size={14}/> Target Bulan Ini
            </p>
            <p className="text-xs font-bold text-gray-500">
              {formatRp(totalSpent)} / {formatRp(monthlyTarget)}
            </p>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full border-2 border-black overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                (totalSpent / monthlyTarget) > 1 ? 'bg-red-400' : 
                (totalSpent / monthlyTarget) > 0.8 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${Math.min((totalSpent / monthlyTarget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1.5 font-bold text-gray-400">
            {totalSpent <= monthlyTarget 
              ? `${Math.round((totalSpent / monthlyTarget) * 100)}% terpakai — sisa ${formatRp(monthlyTarget - totalSpent)}`
              : `Udah lewat ${formatRp(totalSpent - monthlyTarget)}! 😱`
            }
          </p>
        </div>
      )}

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 uppercase">
            <TrendingDown size={16}/> Kemana Aja Uangnya
          </h4>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold">{cat.category}</span>
                  <span className="text-sm font-bold text-gray-600">{formatRp(cat.amount)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-black/20">
                  <div 
                    className={`h-full ${getCategoryColor(cat.category)} rounded-full transition-all duration-500`} 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-0.5 text-right">{cat.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Tagihan Tetap Section */}
      {fixedExpenses.length > 0 && (
        <div className="bg-purple-50 border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h4 className="font-bold text-sm mb-3 flex items-center gap-2 uppercase">
            <Receipt size={16}/> Tagihan Tetap Bulan Ini
          </h4>
          <div className="space-y-2">
            {fixedExpenses.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-black/30">
                <span className="text-sm font-bold">{item.name}</span>
                <span className="text-sm font-bold text-purple-600">{formatRp(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t-2 border-black/10 mt-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Tagihan</span>
              <span className="text-sm font-black">{formatRp(totalFixed)}</span>
            </div>
          </div>
        </div>
      )}

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

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full font-bold text-sm border-2 border-white shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          {toast}
        </div>
      )}

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
        currentIncome={incomeSources}
        currentFixed={fixedExpenses} 
        currentTarget={monthlyTarget}
        onSave={handleSaveSettings}
        onReset={resetData}
        onLogout={logout}
      />

      <DeleteModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        item={itemToDelete || {}}
      />

    </div>
  );
}