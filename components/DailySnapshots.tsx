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
        <button aria-label="prev" onClick={() => scrollBy(-240)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"> <MdChevronLeft /> </button>
        <div ref={scrollRef} className="flex gap-3 py-2 overflow-x-auto px-10">
          {dates.map(d => (
            <div key={d} className="min-w-[160px] bg-[#F4F4F4] border border-[#E8EEF2] rounded-lg p-3">
              <div className="text-xs text-[#1D546C] mb-2">{dayjs(d).format('YYYY-MM-DD')}</div>
              <div className="text-sm text-green-600">In: <span className="font-medium text-[#1A3D64]">+{fmt(daily[d].totalIn)}</span></div>
              <div className="text-sm text-red-600">Out: <span className="font-medium text-[#D32F2F]">-{fmt(daily[d].totalOut)}</span></div>
              <div className="mt-3 font-bold text-[#0C2B4E]">৳{fmt(daily[d].totalIn - daily[d].totalOut)}</div>
            </div>
          ))}
        </div>
        <button aria-label="next" onClick={() => scrollBy(240)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow"> <MdChevronRight /> </button>
      </div>

      {/* desktop: grid 4 columns */}
      <div className="hidden md:grid md:grid-cols-4 gap-3 py-2">
        {dates.map(d => (
          <div key={d} className="bg-[#F4F4F4] border border-[#E8EEF2] rounded-lg p-4">
            <div className="text-xs text-[#1D546C] mb-2">{dayjs(d).format('YYYY-MM-DD')}</div>
            <div className="text-sm text-green-600">In: <span className="font-medium text-[#1A3D64]">+{fmt(daily[d].totalIn)}</span></div>
            <div className="text-sm text-red-600">Out: <span className="font-medium text-[#D32F2F]">-{fmt(daily[d].totalOut)}</span></div>
            <div className="mt-3 font-bold text-[#0C2B4E]">৳{fmt(daily[d].totalIn - daily[d].totalOut)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
