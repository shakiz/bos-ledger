"use client";

import React from 'react'
import { LedgerEntry } from '@prisma/client'
import { calculateDailyTotals } from '@/lib/ledger'
import dayjs from 'dayjs'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'


export default function DailySnapshots({ entries }: { entries: LedgerEntry[] }) {
  const daily = calculateDailyTotals(entries)
  const dates = Object.keys(daily).sort()
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  function scrollBy(amount: number) {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)
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
            <div key={d} className="min-w-[170px] bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm">
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

      {/* desktop: grid 4 columns */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 py-2">
        {dates.map(d => (
          <div key={d} className="bg-slate-50 border border-slate-200 rounded-xl p-2 shadow-sm max-w-[220px]">
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
    </div>
  )
}