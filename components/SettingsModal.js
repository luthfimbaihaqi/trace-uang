"use client"
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Settings, Plus, Receipt, Banknote, Target, LogOut } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, currentIncome, currentFixed, currentTarget, onSave, onReset, onLogout }) {
  // Local state for editing
  const [localIncome, setLocalIncome] = useState([]);
  const [localFixed, setLocalFixed] = useState([]);
  const [localTarget, setLocalTarget] = useState('');

  // Form inputs
  const [newIncomeName, setNewIncomeName] = useState('');
  const [newIncomeAmount, setNewIncomeAmount] = useState('');
  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');

  // Sync saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setLocalIncome(currentIncome || []);
      setLocalFixed(currentFixed || []);
      setLocalTarget(currentTarget || '');
    }
  }, [isOpen, currentIncome, currentFixed, currentTarget]);

  if (!isOpen) return null;

  // --- INCOME HELPERS ---
  const addIncomeItem = (e) => {
    e.preventDefault();
    if (newIncomeName && newIncomeAmount) {
      setLocalIncome([...localIncome, {
        id: Date.now(),
        name: newIncomeName,
        amount: parseInt(newIncomeAmount)
      }]);
      setNewIncomeName('');
      setNewIncomeAmount('');
    }
  };

  const removeIncomeItem = (id) => {
    setLocalIncome(localIncome.filter(item => item.id !== id));
  };

  // --- FIXED EXPENSE HELPERS ---
  const addFixedItem = (e) => {
    e.preventDefault();
    if (newFixedName && newFixedAmount) {
      setLocalFixed([...localFixed, {
        id: Date.now(),
        name: newFixedName,
        amount: parseInt(newFixedAmount)
      }]);
      setNewFixedName('');
      setNewFixedAmount('');
    }
  };

  const removeFixedItem = (id) => {
    setLocalFixed(localFixed.filter(item => item.id !== id));
  };

  // --- CALCULATIONS ---
  const totalIncome = localIncome.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = localFixed.reduce((acc, curr) => acc + curr.amount, 0);
  const netBudget = totalIncome - totalFixed;

  const formatRp = (num) => "Rp " + num.toLocaleString("id-ID");

  const handleSaveAll = () => {
    onSave(localIncome, localFixed, parseInt(localTarget) || 0);
    onClose();
  };

  const handleResetApp = () => {
    if (confirm("Yakin mau hapus SEMUA data (History, Tagihan, Pemasukan)?")) {
      onReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-purple-100 border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 relative animate-in fade-in zoom-in duration-200 my-8 overflow-hidden">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b-2 border-black/10 pb-4">
          <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase leading-none">Pengaturan</h2>
            <p className="text-xs text-gray-600 font-medium">Atur pemasukan & pengeluaran</p>
          </div>
        </div>

        {/* ====== 1. PEMASUKAN ====== */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-sm font-bold mb-2 ml-1">
            <Banknote size={16} className="text-green-600"/>
            <span>Sumber Pemasukan</span>
            <span className="ml-auto text-green-600 font-black text-xs">{formatRp(totalIncome)}</span>
          </label>
          
          {/* Form Tambah */}
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="Nama (ex: Gaji)" 
              className="flex-1 p-2 rounded border-2 border-black text-sm font-medium"
              value={newIncomeName}
              onChange={(e) => setNewIncomeName(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Rp..." 
              className="w-20 p-2 rounded border-2 border-black text-sm font-medium"
              value={newIncomeAmount}
              onChange={(e) => setNewIncomeAmount(e.target.value)}
            />
            <button 
              onClick={addIncomeItem}
              className="bg-green-500 text-white p-2 rounded border-2 border-black active:scale-90 transition-transform"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* List Income */}
          <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
            {localIncome.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2 italic">Belum ada pemasukan.</p>
            )}
            {localIncome.map(item => (
              <div key={item.id} className="bg-white border-2 border-black p-2 rounded flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2">
                  <Banknote size={14} className="text-green-500"/>
                  <span className="text-sm font-bold">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-green-600">{formatRp(item.amount)}</span>
                  <button onClick={() => removeIncomeItem(item.id)} className="text-red-500 hover:bg-red-100 rounded p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====== 2. TAGIHAN TETAP ====== */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-sm font-bold mb-2 ml-1">
            <Receipt size={16} className="text-red-500"/>
            <span>Tagihan Tetap per Bulan</span>
            <span className="ml-auto text-red-500 font-black text-xs">{formatRp(totalFixed)}</span>
          </label>
          
          {/* Form Tambah */}
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              placeholder="Nama (ex: Kost)" 
              className="flex-1 p-2 rounded border-2 border-black text-sm font-medium"
              value={newFixedName}
              onChange={(e) => setNewFixedName(e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Rp..." 
              className="w-20 p-2 rounded border-2 border-black text-sm font-medium"
              value={newFixedAmount}
              onChange={(e) => setNewFixedAmount(e.target.value)}
            />
            <button 
              onClick={addFixedItem}
              className="bg-black text-white p-2 rounded border-2 border-black active:scale-90 transition-transform"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* List Fixed */}
          <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
            {localFixed.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2 italic">Belum ada tagihan tetap.</p>
            )}
            {localFixed.map(item => (
              <div key={item.id} className="bg-white border-2 border-black p-2 rounded flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2">
                  <Receipt size={14} className="text-gray-400"/>
                  <span className="text-sm font-bold">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono">{formatRp(item.amount)}</span>
                  <button onClick={() => removeFixedItem(item.id)} className="text-red-500 hover:bg-red-100 rounded p-1">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ====== 3. TARGET SPENDING ====== */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-sm font-bold mb-1 ml-1">
            <Target size={16} className="text-blue-500"/>
            <span>Target Max Spending</span>
          </label>
          <p className="text-[10px] text-gray-500 font-medium ml-1 mb-2">Opsional. Batas pengeluaran jajan per bulan.</p>
          <input
            type="number"
            value={localTarget}
            onChange={(e) => setLocalTarget(e.target.value)}
            className="w-full p-3 rounded-lg border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-black/20"
            placeholder="Contoh: 2000000 (kosongkan kalau ga mau)"
          />
        </div>

        {/* ====== PREVIEW ====== */}
        <div className="bg-green-100 border-2 border-black border-dashed p-3 rounded-lg mb-6">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
            <span>Total Pemasukan</span>
            <span className="text-green-700">{formatRp(totalIncome)}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
            <span>Total Tagihan</span>
            <span className="text-red-500">-{formatRp(totalFixed)}</span>
          </div>
          <div className="border-t-2 border-black/20 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-green-800 uppercase">Uang Jajan (Net)</span>
              <span className="text-xl font-black text-green-900">{formatRp(netBudget)}</span>
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button 
          onClick={handleSaveAll}
          className="w-full bg-black text-white py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 mb-8"
        >
          <Save size={20} /> SIMPAN PENGATURAN
        </button>

        {/* DANGER ZONE */}
        <div className="text-center border-t-2 border-black/10 pt-4 space-y-3">
          <button 
            onClick={handleResetApp}
            className="text-red-500 text-xs font-bold hover:underline flex items-center justify-center gap-1 w-full"
          >
            <Trash2 size={12} /> RESET SEMUA DATA
          </button>
          <button 
            onClick={onLogout}
            className="text-gray-400 text-xs font-bold hover:underline flex items-center justify-center gap-1 w-full"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>

      </div>
    </div>
  );
}