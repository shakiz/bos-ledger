import '@/styles/globals.css'
import AuthProvider from '@/components/AuthProvider'

export const metadata = {
  title: 'BOS Ledger',
  description: 'Monthly ledger app (Income / Expense)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
