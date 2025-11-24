import { LedgerEntry } from '@prisma/client'
import { calculateDailyTotals } from '@/lib/ledger'
import dayjs from 'dayjs'

export default function LedgerTable({ entries }: { entries: LedgerEntry[] }) {
  const daily = calculateDailyTotals(entries)
  const dates = Object.keys(daily).sort()

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-sm text-[#1D546C] bg-[#F4F4F4]">
            <th className="py-3 px-3">Date</th>
            <th className="py-3 px-3">In</th>
            <th className="py-3 px-3">Out</th>
            <th className="py-3 px-3">Balance</th>
          </tr>
        </thead>
        <tbody>
          {dates.map(d => (
            <tr key={d} className="align-top border-b">
              <td className="py-3 px-3 text-sm text-[#0C2B4E]">{dayjs(d).format('YYYY-MM-DD')}</td>
              <td className="py-3 px-3 text-green-600">+৳{daily[d].totalIn.toFixed(2)}</td>
              <td className="py-3 px-3 text-red-600">-৳{daily[d].totalOut.toFixed(2)}</td>
              <td className="py-3 px-3 font-bold text-[#0C2B4E]">৳{daily[d].balance.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
