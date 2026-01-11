"use client"
import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, onConfirm, item }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      
      {/* Container Modal (Merah Pastel - Danger Zone) */}
      <div className="w-full max-w-sm bg-red-100 border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in fade-in zoom-in duration-200">
        
        {/* Tombol Close (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform"
        >
          <X size={20} />
        </button>

        {/* Header Ikon */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Trash2 size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-black text-center uppercase leading-tight">
            Yakin Mau Hapus?
          </h2>
        </div>

        {/* Detail Item */}
        <div className="bg-white p-4 rounded-lg border-2 border-black text-center mb-6 relative overflow-hidden">
            {/* Pita peringatan kecil */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
            
            <p className="text-gray-500 text-xs font-bold uppercase mb-1">Item yang dihapus:</p>
            <h3 className="text-lg font-black">{item?.name}</h3>
            <p className="text-red-600 font-bold text-xl mt-1">Rp {item?.amount?.toLocaleString('id-ID')}</p>
        </div>

        {/* Pesan Peringatan */}
        <div className="flex items-center gap-2 justify-center text-xs font-bold text-red-800 mb-6 bg-red-200 p-2 rounded border border-red-800/20">
            <AlertTriangle size={16} />
            <span>Saldo kamu bakal nambah lagi, lho.</span>
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3">
            <button 
                onClick={onClose}
                className="flex-1 bg-white text-black py-3 rounded-lg font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
                Batal
            </button>
            <button 
                onClick={onConfirm}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
            >
                <Trash2 size={18} />
                HAPUS
            </button>
        </div>

      </div>
    </div>
  );
}