"use client"
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function ExpenseModal({ isOpen, onClose, category, onSave }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Kalau modal ga open, jangan render apa-apa
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return; // Validasi sederhana

    // Kirim data ke parent (page.js)
    onSave({
      category: category.name,
      amount: parseInt(amount),
      note: note,
      date: new Date().toISOString(), // Simpan waktu input
    });

    // Reset form
    setAmount('');
    setNote('');
  };

  return (
    // Overlay Hitam Transparan
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      
      {/* Container Modal */}
      <div className={`w-full max-w-sm ${category.color} border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in fade-in zoom-in duration-200`}>
        
        {/* Tombol Close (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>

        {/* Judul Modal */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {category.icon}
          </div>
          <h2 className="text-xl font-black text-center uppercase">
            Jajan {category.name}
          </h2>
        </div>

        {/* Form Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Nominal */}
          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Nominal (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full text-2xl font-black p-3 rounded-lg border-2 border-black focus:outline-none focus:ring-4 focus:ring-black/20"
              autoFocus
              required
            />
          </div>

          {/* Input Catatan */}
          <div>
            <label className="block text-sm font-bold mb-1 ml-1">Catatan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Nasi Padang..."
              className="w-full p-3 rounded-lg border-2 border-black text-sm font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
            />
          </div>

          {/* Tombol Simpan */}
          <button 
            type="submit"
            className="w-full bg-black text-white py-4 rounded-lg font-bold text-lg border-2 border-black shadow-[4px_4px_0px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Check size={24} /> SIMPAN
          </button>
        </form>

      </div>
    </div>
  );
}