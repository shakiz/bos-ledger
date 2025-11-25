export default function SummaryCards({ totalIn, totalOut, finalBalance }: { totalIn: number; totalOut: number; finalBalance: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Total In</div>
        <div className="text-lg font-bold text-emerald-600">৳{totalIn.toFixed(2)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Total Out</div>
        <div className="text-lg font-bold text-rose-600">৳{totalOut.toFixed(2)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Final Balance</div>
        <div className="text-lg font-bold" style={{ color: finalBalance >= 0 ? '#0F172A' : '#D32F2F' }}>৳{finalBalance.toFixed(2)}</div>
      </div>
    </div>
  )
}
