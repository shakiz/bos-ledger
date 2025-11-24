"use client"
import React from 'react'
import dayjs from 'dayjs'
import EditEntryModal from './EditEntryModal'

export default function EntryRow({ entry, onDelete }: { entry: any; onDelete?: (id: string) => void }) {
  const [open, setOpen] = React.useState(false)

  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="w-1/6 text-sm text-[#1D546C]">{dayjs(entry.date).format('YYYY-MM-DD')}</div>
      <div className="w-1/6">
        {entry.shipment ? (
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#EAF4FB] text-[#1A3D64] text-sm border border-[#D6EEF9]">{entry.shipment.name}</span>
        ) : (
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#F4F6F8] text-[#6B7280] text-sm">N/A</span>
        )}
      </div>
      <div className="w-2/6 text-sm text-[#0C2B4E]">{entry.description ?? entry.category}</div>
      <div className="w-1/6 text-right text-sm">
        <div className="text-green-600">{entry.type === 'IN' ? `+৳${fmt(Number(entry.amount))}` : '-'}</div>
      </div>
      <div className="w-1/6 text-right text-sm">
        <div className="text-red-600">{entry.type === 'OUT' ? `-৳${fmt(Number(entry.amount))}` : '-'}</div>
      </div>
  <div className="w-1/6 text-right font-bold text-[#0C2B4E]">৳{fmt(Number(entry.runningBalance ?? entry.balance ?? entry.amount))}</div>
      <div className="ml-4 flex items-center gap-2">
        <button className="text-sm text-blue-600" onClick={() => setOpen(true)}>Edit</button>
        <button className="text-sm text-red-500" onClick={() => onDelete?.(entry.id)}>🗑</button>
      </div>
      <EditEntryModal open={open} onClose={() => setOpen(false)} entry={entry} />
    </div>
  )
}
