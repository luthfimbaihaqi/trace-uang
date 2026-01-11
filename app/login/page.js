"use client"
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Mode Login atau Daftar

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // --- LOGIC DAFTAR ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        alert("Gagal daftar: " + error.message);
      } else {
        alert("Hore! Akun jadi. Langsung login otomatis ya...");
        // Bikin default settings buat user baru
        if(data.user) {
            await supabase.from('user_settings').insert([{ user_id: data.user.id, total_budget: 3000000 }]);
        }
        router.push('/'); // Pindah ke Home
      }
    } else {
      // --- LOGIC LOGIN ---
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        alert("Eits, email atau password salah nih! 🤔");
      } else {
        router.push('/'); // Pindah ke Home
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border-2 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 tracking-tighter">
                UANG MIMI
            </h1>
            <p className="text-gray-500 font-bold border-2 border-dashed border-gray-300 inline-block px-3 py-1 rounded-full text-sm">
                {isSignUp ? "Bikin Akun Dulu Mimiiii" : "Login dulu mimiii"}
            </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Input Email */}
            <div>
                <label className="block text-xs font-bold mb-1 ml-1 uppercase">Email</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                        <Mail size={20}/>
                    </div>
                    <input 
                        type="email" 
                        required
                        placeholder="mimi@cantik.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 p-3 rounded-lg border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all"
                    />
                </div>
            </div>

            {/* Input Password */}
            <div>
                <label className="block text-xs font-bold mb-1 ml-1 uppercase">Password</label>
                <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                        <KeyRound size={20}/>
                    </div>
                    <input 
                        type="password" 
                        required
                        placeholder="Rahasia..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 p-3 rounded-lg border-2 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-200 transition-all"
                    />
                </div>
            </div>

            {/* Tombol Aksi */}
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-lg font-black text-lg border-2 border-black shadow-[4px_4px_0px_0px_#888] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
                {loading ? <Loader2 className="animate-spin"/> : (
                    <>
                        {isSignUp ? "DAFTAR SEKARANG" : "MASUK APLIKASI"} <ArrowRight strokeWidth={3} />
                    </>
                )}
            </button>

        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-sm font-bold">
            <p className="text-gray-500">
                {isSignUp ? "Sudah punya akun?" : "Belum punya akun?"}
                <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-blue-600 underline decoration-2 hover:text-blue-800"
                >
                    {isSignUp ? "Login aja" : "Daftar sini"}
                </button>
            </p>
        </div>

      </div>
    </div>
  );
}