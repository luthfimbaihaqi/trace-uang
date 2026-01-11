import './globals.css'
import { Inter } from 'next/font/google'
import { BudgetProvider } from '../context/BudgetContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: "Uang Mimi",
  description: "Aplikasi Keuangan Kesayangan",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
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

        {/* --- SCRIPT TAMBAHAN PWA START --- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('SW Registered!', registration.scope);
                    },
                    function(err) {
                      console.log('SW Failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        {/* --- SCRIPT TAMBAHAN PWA END --- */}
        
      </body>
    </html>
  )
}