"use client"
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Settings, Plus, Receipt } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, currentBudget, currentFixed, onSave, onReset }) {
  // Gunakan local state untuk editing
  const [localBudget, setLocalBudget] = useState('');
  const [localFixed, setLocalFixed] = useState([]);
  
  // Form input tagihan baru
  const [newFixedName, setNewFixedName] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');

  // Sync saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setLocalBudget(currentBudget);
      setLocalFixed(currentFixed || []);
    }
  }, [isOpen, currentBudget, currentFixed]);

  if (!isOpen) return null;

  // Helper Add Tagihan
  const addFixedItem = (e) => {
    e.preventDefault();
    if (newFixedName && newFixedAmount) {
      const newItem = {
        id: Date.now(),
        name: newFixedName,
        amount: parseInt(newFixedAmount)
      };
      setLocalFixed([...localFixed, newItem]);
      setNewFixedName('');
      setNewFixedAmount('');
    }
  };

  // Helper Hapus Tagihan
  const removeFixedItem = (id) => {
    setLocalFixed(localFixed.filter(item => item.id !== id));
  };

  // Hitungan Preview
  const totalFixedVal = localFixed.reduce((acc, curr) => acc + curr.amount, 0);
  const netBudgetVal = (parseInt(localBudget) || 0) - totalFixedVal;

  const handleSaveAll = () => {
    onSave(parseInt(localBudget), localFixed); // Kirim 2 data sekaligus
    onClose();
  };

  const handleResetApp = () => {
    if (confirm("Yakin mau hapus SEMUA data (History & Tagihan)?")) {
        onReset();
        onClose();
    }
  };

  const formatRp = (num) => "Rp " + num.toLocaleString("id-ID");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-purple-100 border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in fade-in zoom-in duration-200 my-8">
        
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
            <p className="text-xs text-gray-600 font-medium">Atur budget & tagihan</p>
          </div>
        </div>

        {/* 1. INPUT TOTAL BUDGET */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-1 ml-1">Total Uang Mimi</label>
          <input
            type="number"
            value={localBudget}
            onChange={(e) => setLocalBudget(e.target.value)}
            className="w-full text-xl font-black p-3 rounded-lg border-2 border-black focus:outline-none focus:ring-4 focus:ring-black/20"
            placeholder="0"
          />
        </div>

        {/* 2. LIST TAGIHAN TETAP */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 ml-1 flex justify-between">
            <span>Tagihan Tetap per Bulan</span>
            <span className="text-gray-500 font-normal">{formatRp(totalFixedVal)}</span>
          </label>
          
          {/* Form Tambah Kecil */}
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
               className="w-24 p-2 rounded border-2 border-black text-sm font-medium"
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

          {/* List Item */}
          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
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
                        <span className="text-sm font-mono">{formatRp(item.amount)}</span>
                        <button onClick={() => removeFixedItem(item.id)} className="text-red-500 hover:bg-red-100 rounded p-1">
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ))}
          </div>
        </div>

        {/* 3. PREVIEW NET BUDGET */}
        <div className="bg-green-100 border-2 border-black border-dashed p-3 rounded-lg mb-6 text-center">
            <p className="text-xs text-green-800 font-bold uppercase mb-1">Uang Jajan Kamu (Net)</p>
            <p className="text-2xl font-black text-green-900">{formatRp(netBudgetVal)}</p>
        </div>

        {/* ACTIONS */}
        <button 
            onClick={handleSaveAll}
            className="w-full bg-black text-white py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 mb-8"
        >
            <Save size={20} /> SIMPAN PENGATURAN
        </button>

        {/* DANGER */}
        <div className="text-center border-t-2 border-black/10 pt-4">
            <button 
                onClick={handleResetApp}
                className="text-red-500 text-xs font-bold hover:underline flex items-center justify-center gap-1 w-full"
            >
                <Trash2 size={12} /> RESET SEMUA DATA
            </button>
        </div>

      </div>
    </div>
  );
}