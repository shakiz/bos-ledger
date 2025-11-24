import '@/styles/globals.css'

export const metadata = {
  title: 'BOS Ledger',
  description: 'Monthly ledger app (Income / Expense)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
