import './globals.css'
import { Inter } from 'next/font/google'
import { BudgetProvider } from '../context/BudgetContext' // <--- IMPORT INI

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Uang Mimi",
  description: "Aplikasi Keuangan Kesayangan",
  manifest: "/manifest.json", // <--- Tambah ini
  themeColor: "#000000",      // <--- Tambah ini (Warna status bar HP)
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0", // Biar gak bisa di-zoom cubit (rasa native app)
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <main className="max-w-[480px] mx-auto min-h-screen bg-white border-x-2 border-black/10 shadow-2xl relative overflow-hidden flex flex-col">
          {/* Bungkus Children dengan BudgetProvider */}
          <BudgetProvider>
            {children}
          </BudgetProvider>
        </main>
      </body>
    </html>
  )
}