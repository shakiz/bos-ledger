"use client";

import React from 'react'
import { LedgerEntry } from '@prisma/client'
import { calculateDailyTotals } from '@/lib/ledger'
import dayjs from 'dayjs'
import { MdChevronLeft, MdChevronRight, MdDelete } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import ConfirmDialog from './ConfirmDialog'


export default function DailySnapshots({ entries }: { entries: LedgerEntry[] }) {
  const router = useRouter()
  const daily = calculateDailyTotals(entries)
  const dates = Object.keys(daily).sort()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const [deleteDate, setDeleteDate] = React.useState<string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)

  function scrollBy(amount: number) {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)
  }

  async function handleDeleteDay(date: string) {
    setIsDeleting(true)
    try {
      // Get all entries for this date
      const entriesToDelete = entries.filter(e => {
        const entryDate = dayjs(e.date).format('YYYY-MM-DD')
        return entryDate === date
      })

      // Delete all entries for this day
      await Promise.all(
        entriesToDelete.map(entry =>
          fetch(`/api/ledger/${entry.id}`, { method: 'DELETE' })
        )
      )

      // Close dialog and refresh data
      setDeleteDate(null)
      router.refresh()
    } catch (err) {
      console.error('Delete failed:', err)
      alert('Failed to delete entries. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="relative">
      {/* small screens: horizontal scroll with arrows */}
      <div className="md:hidden">
        <button
          aria-label="prev"
          onClick={() => scrollBy(-240)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
        >
          <MdChevronLeft />
        </button>
        <div ref={scrollRef} className="flex gap-3 py-2 overflow-x-auto px-4">
          {dates.map(d => (
            <div key={d} className="min-w-[170px] bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm relative group">
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDate(d)
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete day"
              >
                <MdDelete size={16} />
              </button>

              <div className="text-sm text-slate-600 font-semibold mb-2">{dayjs(d).format('YYYY-MM-DD')}</div>
              <div className="flex items-center justify-between text-sm mb-0.5">
                <div className="text-emerald-600">In:</div>
                <div className="text-emerald-700 font-medium"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+{fmt(daily[d].totalIn)}</span></div>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-rose-600">Out:</div>
                <div className="text-rose-700 font-medium"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">-{fmt(daily[d].totalOut)}</span></div>
              </div>
              <div className="border-t pt-2 mt-1">
                <div className="text-base font-bold text-slate-900">৳{fmt(daily[d].totalIn - daily[d].totalOut)}</div>
              </div>
            </div>
          ))}
        </div>
        <button
          aria-label="next"
          onClick={() => scrollBy(240)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"
        >
          <MdChevronRight />
        </button>
      </div>

      {/* desktop: grid 5 columns */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 py-2">
        {dates.map(d => (
          <div key={d} className="bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm max-w-[220px] relative group">
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setDeleteDate(d)
              }}
              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete day"
            >
              <MdDelete size={16} />
            </button>

            <div className="text-sm text-slate-600 font-semibold mb-2">{dayjs(d).format('YYYY-MM-DD')}</div>
            <div className="flex items-center justify-between text-sm mb-0.5">
              <div className="text-emerald-600">In:</div>
              <div className="text-emerald-700 font-medium"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">+{fmt(daily[d].totalIn)}</span></div>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="text-rose-600">Out:</div>
              <div className="text-rose-700 font-medium"><span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">-{fmt(daily[d].totalOut)}</span></div>
            </div>
            <div className="border-t pt-2 mt-1">
              <div className="text-lg font-bold text-slate-900">৳{fmt(daily[d].totalIn - daily[d].totalOut)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDate}
        title="Delete All Transactions?"
        message={`Are you sure you want to delete all transactions for ${deleteDate}? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={() => deleteDate && handleDeleteDay(deleteDate)}
        onCancel={() => setDeleteDate(null)}
        variant="danger"
      />
    </div>
  )
}