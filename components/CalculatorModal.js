"use client"
import React, { useState, useEffect } from 'react';
import { X, Calculator, Target, PiggyBank, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CalculatorModal({ isOpen, onClose, netBudget }) {
  // 1. SEMUA HOOKS (useState) DI TARUH PALING ATAS
  const [mode, setMode] = useState('target'); 

  // State Input
  const [inputA_Price, setInputA_Price] = useState('');     
  const [inputA_Month, setInputA_Month] = useState('');     
  
  const [inputB_Daily, setInputB_Daily] = useState('');     
  const [inputB_Month, setInputB_Month] = useState('');     

  // Hasil Perhitungan
  const [result, setResult] = useState(null);
  const [realityCheck, setRealityCheck] = useState(null);

  // 2. LOGIC FUNCTION (Bukan Hook, aman ditaruh di sini)
  const calculate = () => {
    // Reset dulu
    setResult(null);
    setRealityCheck(null);

    // Hitung Jatah Jajan Harian (Realita)
    // Cegah pembagian 0/NaN kalau netBudget belum ada
    const safeNetBudget = netBudget || 0;
    const dailyAllowance = safeNetBudget / 30; 

    if (mode === 'target') {
      // MODE A
      const price = parseInt(inputA_Price);
      const months = parseInt(inputA_Month);

      if (!price || !months) return;

      const monthlySaving = price / months;
      const dailySaving = monthlySaving / 30;

      setResult({
        label: "Harus Sisihkan Per Hari:",
        value: dailySaving,
        info: `Total ${months} bulan`
      });

      // Reality Check Mode A
      if (dailySaving > dailyAllowance) {
        setRealityCheck({
            type: 'danger',
            text: `MUSTAHIL! 😱 Jatah jajanmu cuma Rp ${dailyAllowance.toLocaleString('id-ID')}/hari. Masa mau nabung Rp ${dailySaving.toLocaleString('id-ID')}?`
        });
      } else if (dailySaving > (dailyAllowance * 0.7)) {
        setRealityCheck({
            type: 'warning',
            text: `Berat banget, Mi 😐. Ini makan 70%+ uang jajan harian kamu loh.`
        });
      } else {
        setRealityCheck({
            type: 'safe',
            text: `Gas! Masih aman. Sisa uang jajan masih cukup buat bakso. 😎`
        });
      }

    } else {
      // MODE B
      const daily = parseInt(inputB_Daily);
      const months = parseInt(inputB_Month);

      if (!daily || !months) return;

      const totalCollected = daily * 30 * months;

      setResult({
        label: "Uang Terkumpul:",
        value: totalCollected,
        info: `Setelah ${months} bulan`
      });

      // Reality Check Mode B
      if (daily > dailyAllowance) {
        setRealityCheck({
            type: 'danger',
            text: `JANGAN HALU! 😭 Kamu ga punya uang segitu buat ditabung tiap hari.`
        });
      } else if (daily > (dailyAllowance * 0.5)) {
        setRealityCheck({
            type: 'warning',
            text: `Yakin? Kamu bakal hidup super irit loh kalau nabung segini.`
        });
      } else {
        setRealityCheck({
            type: 'safe',
            text: `Ciluk ba! Bisa banget ini mah. Lanjutkannn! 🤑`
        });
      }
    }
  };

  // 3. HOOK useEffect (WAJIB DIPANGGIL SEBELUM RETURN)
  // Auto calculate saat input berubah
  useEffect(() => {
    // Cek dulu apakah modal terbuka, biar gak running background process yg ga perlu
    if (isOpen) {
        calculate();
    }
  }, [inputA_Price, inputA_Month, inputB_Daily, inputB_Month, mode, isOpen]); // Tambahkan isOpen ke dependency

  // 4. BARU DEH CEK KONDISI RETURN (Early Return)
  // Pindahkan ini ke paling bawah logic, tepat sebelum render JSX
  if (!isOpen) return null;

  const formatRp = (num) => "Rp " + Math.round(num).toLocaleString("id-ID");

  // 5. RENDER JSX
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-sm bg-blue-100 border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative animate-in fade-in zoom-in duration-200 my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-transform z-10"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Calculator size={32} className="text-blue-600" />
          </div>
          <h2 className="text-xl font-black text-center uppercase">
            Kalkulator Mimi
          </h2>
          <p className="text-xs font-bold text-gray-500">Mimi mau hitung apa?</p>
        </div>

        {/* Tabs Mode */}
        <div className="flex border-2 border-black rounded-lg overflow-hidden mb-6 bg-white">
            <button 
                onClick={() => setMode('target')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mode === 'target' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
                <Target size={16} /> Target Barang
            </button>
            <div className="w-0.5 bg-black"></div>
            <button 
                onClick={() => setMode('saving')}
                className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 ${mode === 'saving' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
                <PiggyBank size={16} /> Nabung Rutin
            </button>
        </div>

        {/* INPUTS */}
        <div className="space-y-4 mb-6">
            {mode === 'target' ? (
                <>
                    <div>
                        <label className="block text-xs font-bold mb-1">Mau beli barang seharga berapa?</label>
                        <input type="number" placeholder="Contoh: 15000000" className="w-full p-3 rounded-lg border-2 border-black font-bold"
                            value={inputA_Price} onChange={e => setInputA_Price(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Mau tercapai dalam berapa bulan?</label>
                        <input type="number" placeholder="Contoh: 12" className="w-full p-3 rounded-lg border-2 border-black font-bold"
                            value={inputA_Month} onChange={e => setInputA_Month(e.target.value)}
                        />
                    </div>
                </>
            ) : (
                <>
                     <div>
                        <label className="block text-xs font-bold mb-1">Sanggup nabung berapa sehari?</label>
                        <input type="number" placeholder="Contoh: 20000" className="w-full p-3 rounded-lg border-2 border-black font-bold"
                            value={inputB_Daily} onChange={e => setInputB_Daily(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1">Konsisten selama berapa bulan?</label>
                        <input type="number" placeholder="Contoh: 12" className="w-full p-3 rounded-lg border-2 border-black font-bold"
                            value={inputB_Month} onChange={e => setInputB_Month(e.target.value)}
                        />
                    </div>
                </>
            )}
        </div>

        {/* RESULT CARD */}
        {result && (
            <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center animate-in zoom-in duration-300">
                <p className="text-xs text-gray-500 font-bold uppercase mb-1">{result.label}</p>
                <h3 className="text-3xl font-black text-blue-600 mb-1">{formatRp(result.value)}</h3>
                <p className="text-xs font-medium text-gray-400 italic mb-4">{result.info}</p>

                {/* REALITY CHECK BOX */}
                {realityCheck && (
                    <div className={`p-3 rounded-lg border-2 border-black text-xs font-bold flex items-start gap-2 text-left
                        ${realityCheck.type === 'danger' ? 'bg-red-200 text-red-900' : 
                          realityCheck.type === 'warning' ? 'bg-yellow-200 text-yellow-900' : 
                          'bg-green-200 text-green-900'
                        }
                    `}>
                        {realityCheck.type === 'danger' ? <AlertTriangle size={24} className="shrink-0"/> :
                         realityCheck.type === 'warning' ? <AlertTriangle size={24} className="shrink-0"/> :
                         <CheckCircle2 size={24} className="shrink-0"/>
                        }
                        <span>{realityCheck.text}</span>
                    </div>
                )}
            </div>
        )}

        {!result && (
            <div className="text-center py-8 text-gray-400 text-sm font-bold border-2 border-dashed border-black/20 rounded-xl">
                Isi data di atas dulu ya...
            </div>
        )}

      </div>
    </div>
  );
}