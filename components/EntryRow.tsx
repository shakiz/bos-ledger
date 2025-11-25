"use client"
import React from 'react'
import dayjs from 'dayjs'
import EditEntryModal from './EditEntryModal'
import { MdEdit, MdDelete } from 'react-icons/md'

export default function EntryRow({ entry, onDelete, showDivider = true }: { entry: any; onDelete?: (id: string) => void; showDivider?: boolean }) {
  const [open, setOpen] = React.useState(false)

  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  return (
    // responsive: stack on small screens, use 10 columns on md+ so edit/delete each have their own column
    <div className={`grid grid-cols-1 md:grid-cols-10 items-center py-4 ${showDivider ? 'border-b' : ''}`}>
      <div className="col-span-1 text-sm text-[#1D546C]">{dayjs(entry.date).format('YYYY-MM-DD')}</div>
      <div className="col-span-1">
        {entry.shipment ? (
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#EAF4FB] text-[#1A3D64] text-sm border border-[#D6EEF9]">{entry.shipment.name}</span>
        ) : (
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#F4F6F8] text-[#6B7280] text-sm">N/A</span>
        )}
      </div>
      <div className="col-span-3 md:col-span-3 text-sm text-[#0C2B4E]">{entry.description ?? entry.category}</div>
      <div className="col-span-1 text-right text-sm md:col-span-1">
        <div className="text-green-600">{entry.type === 'IN' ? `+৳${fmt(Number(entry.amount))}` : '-'}</div>
      </div>
      <div className="col-span-1 text-right text-sm md:col-span-1">
        <div className="text-red-600">{entry.type === 'OUT' ? `-৳${fmt(Number(entry.amount))}` : '-'}</div>
      </div>
      <div className="col-span-1 text-right font-bold text-[#0C2B4E] md:col-span-1">৳{fmt(Number(entry.runningBalance ?? entry.balance ?? entry.amount))}</div>
      {/* Edit icon column */}
      <div className="col-span-1 md:col-span-1 flex items-center justify-center">
        <button aria-label="Edit" onClick={() => setOpen(true)} className="p-2 rounded hover:bg-[#F4F6F8] text-[#1A3D64]">
          <MdEdit size={18} />
        </button>
      </div>
      {/* Delete icon column */}
      <div className="col-span-1 md:col-span-1 flex items-center justify-center">
        <button aria-label="Delete" onClick={() => onDelete?.(entry.id)} className="p-2 rounded hover:bg-[#FFF1F1] text-[#D32F2F]">
          <MdDelete size={18} />
        </button>
      </div>
      <EditEntryModal open={open} onClose={() => setOpen(false)} entry={entry} />
    </div>
  )
}
