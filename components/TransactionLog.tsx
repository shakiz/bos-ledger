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
      <div className="overflow-x-auto">
  <div className="min-w-full">

    {/* HEADER */}
    <div className="grid grid-cols-7 bg-[#F4F4F4] border rounded-t-md text-sm text-[#1D546C] px-4 py-3 items-center">
      <div className="col-span-1 flex items-center">Date</div>
      <div className="col-span-1 flex items-center">Transactions</div>
      <div className="col-span-2 flex items-center">Notes</div>
      <div className="col-span-1 flex items-center justify-end text-green-600">Money In</div>
      <div className="col-span-1 flex items-center justify-end text-red-600">Money Out</div>
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
            className="grid grid-cols-7 px-4 py-3 border-b items-center hover:bg-[#FAFCFD] cursor-pointer"
            onClick={() => setOpenDate(date)}
          >
            <div className="col-span-1 flex items-center text-sm text-[#1D546C]">{date}</div>

            <div className="col-span-1 flex items-center text-sm">
              {list.length} items
            </div>

            <div className="col-span-2 flex items-center text-sm text-[#0C2B4E]">
              {list[0]?.description ?? list[0]?.category ?? ""}
            </div>

            <div className="col-span-1 flex items-center justify-end text-green-600">
              +৳{fmt(inSum)}
            </div>

            <div className="col-span-1 flex items-center justify-end text-red-600">
              -৳{fmt(outSum)}
            </div>

            <div className="col-span-1 flex items-center justify-end font-bold text-[#0C2B4E]">
              ৳{fmt(balance)}
            </div>
          </div>
        )
      })}
    </div>
  </div>
      </div>


      <Modal open={!!openDate} onClose={() => setOpenDate(null)}>
        <div>
          <h3 className="text-lg font-semibold mb-3">Transactions for {openDate}</h3>
          <div className="space-y-2">
            {/* header for detail modal (match EntryRow 10-col layout) */}
            <div className="grid grid-cols-1 md:grid-cols-10 bg-[#F8FAFB] border rounded text-sm text-[#1D546C] px-3 py-2 items-center">
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Shipment</div>
              <div className="col-span-3">Notes</div>
              <div className="col-span-1 text-right text-green-600">Money In</div>
              <div className="col-span-1 text-right text-red-600">Money Out</div>
              <div className="col-span-1 text-right">Balance</div>
              <div className="col-span-1 text-center">Edit</div>
              <div className="col-span-1 text-center">Delete</div>
            </div>
            {(openDate ? grouped[openDate] ?? [] : []).map((entry: any) => (
              <div key={entry.id} className="p-2 bg-white rounded">
                <EntryRow entry={entry} onDelete={handleDelete} showDivider={false} />
              </div>
            ))}
            {openDate && grouped[openDate] && grouped[openDate].length === 0 && <div className="text-sm text-gray-500">No transactions for this date.</div>}
          </div>
        </div>
      </Modal>
    </div>
  )
}
