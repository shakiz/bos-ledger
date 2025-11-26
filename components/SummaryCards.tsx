import { MdTrendingDown, MdTrendingUp } from 'react-icons/md'

export default function SummaryCards({ totalIn, totalOut, finalBalance }: { totalIn: number; totalOut: number; finalBalance: number }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
          <MdTrendingDown className="text-emerald-600" size={16} />
          <span>Total In</span>
        </div>
        <div className="text-lg font-bold text-emerald-600">৳{totalIn.toFixed(2)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm">
        <div className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1">
          <MdTrendingUp className="text-rose-600" size={16} />
          <span>Total Out</span>
        </div>
        <div className="text-lg font-bold text-rose-600">৳{totalOut.toFixed(2)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm">
        <div className="text-xs font-medium text-slate-500">Final Balance</div>
        <div className="text-lg font-bold" style={{ color: finalBalance >= 0 ? '#0F172A' : '#D32F2F' }}>৳{finalBalance.toFixed(2)}</div>
      </div>
    </div>
  )
}
