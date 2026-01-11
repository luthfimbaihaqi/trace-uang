"use client"
import React from 'react';
import { X, Lightbulb } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, totalBudget }) {
  if (!isOpen) return null;

  // Hitung ulang data untuk ditampilkan di teks
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyBudget = Math.round(totalBudget / daysInMonth);
  const formatRp = (num) => "Rp " + num.toLocaleString("id-ID");

  return (
    // Overlay
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      
      {/* Container Modal (Kuning Pastel ala Sticky Note) */}
      <div className="w-full max-w-sm bg-yellow-100 border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-14 h-14 bg-white border-2 border-black rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Lightbulb size={28} className="text-yellow-500 fill-yellow-500" />
          </div>
          <h2 className="text-xl font-black text-center uppercase leading-none">
            Apa itu <br/> Idealnya Sisa?
          </h2>
        </div>

        {/* Konten Penjelasan */}
        <div className="space-y-4 text-sm font-medium border-t-2 border-black/10 pt-4">
          <p>
            Ini adalah <span className="font-black bg-white px-1 border border-black rounded">Patokan Garis Aman</span> kamu, sayang.
          </p>

          <div className="bg-white p-3 rounded-lg border-2 border-black border-dashed">
            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Logikanya:</p>
            <p>
              Uang <b>{formatRp(totalBudget)}</b> dibagi rata untuk <b>{daysInMonth} hari</b>.
            </p>
            <p className="mt-1">
              Jadi jatah per hari = <span className="font-black text-blue-600">{formatRp(dailyBudget)}</span>
            </p>
          </div>

          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-xl">🤑</span>
              <span>Kalau saldo <b>DI ATAS</b> angka ini = <span className="font-bold text-green-600">Mimi Hemat/Kaya</span></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-xl">😱</span>
              <span>Kalau saldo <b>DI BAWAH</b> angka ini = <span className="font-bold text-red-600">Mimi Boros</span></span>
            </li>
          </ul>

          <p className="text-center font-bold text-gray-600 pt-2">
            "Usahakan saldonya jangan turun di bawah angka ini ya!"
          </p>
        </div>

        {/* Tombol OK */}
        <button 
          onClick={onClose}
          className="w-full bg-black text-white py-3 rounded-lg font-bold text-lg border-2 border-black shadow-[4px_4px_0px_0px_#ffffff] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all mt-6"
        >
          OCE UPI!
        </button>

      </div>
    </div>
  );
}