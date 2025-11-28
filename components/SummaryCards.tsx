import { MdTrendingDown, MdTrendingUp } from 'react-icons/md'

export default function SummaryCards({ totalIn, totalOut, finalBalance }: { totalIn: number; totalOut: number; finalBalance: number }) {
  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3 text-slate-600 shadow-sm">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-500 mb-1">
          <MdTrendingDown className="text-emerald-600 flex-shrink-0" size={14} />
          <span className="truncate">Total In</span>
        </div>
        <div className="text-sm sm:text-lg font-bold text-emerald-600 break-all">৳{fmt(totalIn)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3 text-slate-600 shadow-sm">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-medium text-slate-500 mb-1">
          <MdTrendingUp className="text-rose-600 flex-shrink-0" size={14} />
          <span className="truncate">Total Out</span>
        </div>
        <div className="text-sm sm:text-lg font-bold text-rose-600 break-all">৳{fmt(totalOut)}</div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 sm:p-3 text-slate-600 shadow-sm">
        <div className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">Final Balance</div>
        <div className="text-sm sm:text-lg font-bold break-all" style={{ color: finalBalance >= 0 ? '#0F172A' : '#D32F2F' }}>৳{fmt(finalBalance)}</div>
      </div>
    </div>
  )
}
