"use client"
import React from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import EntryRow from './EntryRow'
import Modal from './Modal'

export default function TransactionLog({ entries }: { entries: any[] }) {
  const router = useRouter()
  const [openDate, setOpenDate] = React.useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    try {
      await fetch(`/api/ledger/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  if (!entries || entries.length === 0) return <div className="text-sm text-gray-500">No transactions yet.</div>

  // group entries by date
  const grouped: Record<string, any[]> = {}
  for (const e of entries) {
    const d = dayjs(e.date).format('YYYY-MM-DD')
    grouped[d] = grouped[d] ?? []
    grouped[d].push(e)
  }

  const dates = Object.keys(grouped).sort()

  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  return (
    <div>
      {/* DESKTOP VIEW - Table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          {/* HEADER */}
          <div className="grid grid-cols-7 bg-slate-50 border border-slate-200 rounded-t-md text-sm text-slate-600 px-4 py-3 items-center">
            <div className="col-span-1 flex items-center">Date</div>
            <div className="col-span-1 flex items-center">Transactions</div>
            <div className="col-span-2 flex items-center">Notes</div>
            <div className="col-span-1 flex items-center justify-end text-emerald-600">Money In</div>
            <div className="col-span-1 flex items-center justify-end text-rose-600">Money Out</div>
            <div className="col-span-1 flex items-center justify-end">Balance</div>
          </div>

          {/* BODY */}
          <div>
            {dates.map(date => {
              const list = grouped[date]
              let inSum = 0
              let outSum = 0

              list.forEach(it => {
                const amt = typeof it.amount === "string" ? parseFloat(it.amount) : Number(it.amount)
                if (it.type === "IN") inSum += amt
                else outSum += amt
              })

              const balance = inSum - outSum

              return (
                <div
                  key={date}
                  className="grid grid-cols-7 px-4 py-3 border-b border-slate-200 items-center hover:bg-slate-50 cursor-pointer"
                  onClick={() => setOpenDate(date)}
                >
                  <div className="col-span-1 flex items-center text-sm text-[#1D546C]">{date}</div>
                  <div className="col-span-1 flex items-center text-sm">{list.length} items</div>
                  <div className="col-span-2 flex items-center text-sm text-[#0C2B4E]">
                    {list[0]?.description ?? list[0]?.category ?? ""}
                  </div>
                  <div className="col-span-1 flex items-center justify-end text-emerald-600">
                    +৳{fmt(inSum)}
                  </div>
                  <div className="col-span-1 flex items-center justify-end text-rose-600">
                    -৳{fmt(outSum)}
                  </div>
                  <div className="col-span-1 flex items-center justify-end font-bold text-slate-900">
                    ৳{fmt(balance)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW - Cards */}
      <div className="md:hidden space-y-3">
        {dates.map(date => {
          const list = grouped[date]
          let inSum = 0
          let outSum = 0

          list.forEach(it => {
            const amt = typeof it.amount === "string" ? parseFloat(it.amount) : Number(it.amount)
            if (it.type === "IN") inSum += amt
            else outSum += amt
          })

          const balance = inSum - outSum

          return (
            <div
              key={date}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm active:shadow-md transition-shadow cursor-pointer"
              onClick={() => setOpenDate(date)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-sm font-medium text-[#1D546C]">{date}</div>
                  <div className="text-xs text-gray-500 mt-1">{list.length} transaction{list.length > 1 ? 's' : ''}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-900">৳{fmt(balance)}</div>
                  <div className="text-xs text-gray-500">Balance</div>
                </div>
              </div>

              <div className="text-sm text-[#0C2B4E] mb-3 truncate">
                {list[0]?.description ?? list[0]?.category ?? "No description"}
              </div>

              <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1">
                  <span className="text-emerald-600 font-medium">+৳{fmt(inSum)}</span>
                  <span className="text-xs text-gray-400">In</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-rose-600 font-medium">-৳{fmt(outSum)}</span>
                  <span className="text-xs text-gray-400">Out</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal open={!!openDate} onClose={() => setOpenDate(null)}>
        <div>
          <h3 className="text-lg font-semibold mb-4">Transactions for {openDate}</h3>

          {/* DESKTOP - Table Header */}
          <div className="hidden md:block">
            <div className="grid grid-cols-10 bg-slate-50 border border-slate-200 rounded text-sm text-slate-600 px-3 py-2 items-center mb-2">
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Shipment</div>
              <div className="col-span-3">Notes</div>
              <div className="col-span-1 text-right text-green-600">Money In</div>
              <div className="col-span-1 text-right text-red-600">Money Out</div>
              <div className="col-span-1 text-right">Balance</div>
              <div className="col-span-1 text-center">Edit</div>
              <div className="col-span-1 text-center">Delete</div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-2">
            {(openDate ? grouped[openDate] ?? [] : []).map((entry: any) => (
              <div key={entry.id} className="p-2 md:p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <EntryRow entry={entry} onDelete={handleDelete} showDivider={false} />
              </div>
            ))}
            {openDate && grouped[openDate] && grouped[openDate].length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">No transactions for this date.</div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
