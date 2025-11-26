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
    <>
      {/* DESKTOP VIEW - Table Row */}
      <div className={`hidden md:grid md:grid-cols-10 items-center py-4 ${showDivider ? 'border-b border-slate-200' : ''}`}>
        <div className="col-span-1 text-sm text-[#1D546C]">{dayjs(entry.date).format('YYYY-MM-DD')}</div>
        <div className="col-span-1">
          {entry.shipment ? (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 text-sm border border-slate-200">{entry.shipment.name}</span>
          ) : (
            <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-sm">N/A</span>
          )}
        </div>
        <div className="col-span-3 text-sm text-[#0C2B4E]">{entry.description ?? entry.category}</div>
        <div className="col-span-1 text-right text-sm">
          <div className="text-emerald-600">{entry.type === 'IN' ? `+৳${fmt(Number(entry.amount))}` : '-'}</div>
        </div>
        <div className="col-span-1 text-right text-sm">
          <div className="text-rose-600">{entry.type === 'OUT' ? `-৳${fmt(Number(entry.amount))}` : '-'}</div>
        </div>
        <div className="col-span-1 text-right font-bold text-slate-900">৳{fmt(Number(entry.runningBalance ?? entry.balance ?? entry.amount))}</div>
        <div className="col-span-1 flex items-center justify-center">
          <button aria-label="Edit" onClick={() => setOpen(true)} className="p-2 rounded hover:bg-slate-50 text-indigo-600">
            <MdEdit size={18} />
          </button>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <button aria-label="Delete" onClick={() => onDelete?.(entry.id)} className="p-2 rounded hover:bg-rose-50 text-rose-600">
            <MdDelete size={18} />
          </button>
        </div>
      </div>

      {/* MOBILE VIEW - Card */}
      <div className={`md:hidden ${showDivider ? 'border-b border-slate-200 pb-4 mb-4' : ''}`}>
        <div className="space-y-3">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm font-medium text-[#1D546C]">{dayjs(entry.date).format('MMM DD, YYYY')}</div>
              {entry.shipment && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">
                  {entry.shipment.name}
                </span>
              )}
            </div>
            <div className="flex gap-1">
              <button aria-label="Edit" onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-indigo-50 text-indigo-600 active:bg-indigo-100">
                <MdEdit size={20} />
              </button>
              <button aria-label="Delete" onClick={() => onDelete?.(entry.id)} className="p-2 rounded-lg hover:bg-rose-50 text-rose-600 active:bg-rose-100">
                <MdDelete size={20} />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-[#0C2B4E]">{entry.description ?? entry.category ?? 'No description'}</div>

          {/* Amount and Balance */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div>
              {entry.type === 'IN' ? (
                <div className="text-emerald-600 font-semibold">+৳{fmt(Number(entry.amount))}</div>
              ) : (
                <div className="text-rose-600 font-semibold">-৳{fmt(Number(entry.amount))}</div>
              )}
              <div className="text-xs text-gray-400 mt-0.5">{entry.type === 'IN' ? 'Money In' : 'Money Out'}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">৳{fmt(Number(entry.runningBalance ?? entry.balance ?? entry.amount))}</div>
              <div className="text-xs text-gray-400 mt-0.5">Balance</div>
            </div>
          </div>
        </div>
      </div>

      <EditEntryModal open={open} onClose={() => setOpen(false)} entry={entry} />
    </>
  )
}
