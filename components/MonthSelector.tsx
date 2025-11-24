"use client"
import { useRouter, useSearchParams } from 'next/navigation'

import dayjs from 'dayjs'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export default function MonthSelector({ currentMonth }: { currentMonth?: string }) {
  const router = useRouter()
  const sp = useSearchParams()
  const month = currentMonth ?? sp?.get('month') ?? dayjs().format('YYYY-MM')

  function go(delta: number) {
    const next = dayjs(month + '-01').add(delta, 'month').format('YYYY-MM')
    router.push(`/dashboard?month=${next}`)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">Month</div>
        <div className="text-sm text-gray-500">{dayjs(month + '-01').format('MMMM YYYY')}</div>
      </div>
      <div className="flex gap-2">
        <button
          className="flex items-center gap-1 hover:bg-[#F4F4F4] text-[#0C2B4E] p-1 rounded-full transition-colors"
          onClick={() => go(-1)}
          aria-label="Previous Month"
          style={{ background: 'none', border: 'none' }}
        >
          <MdChevronLeft size={28} color="#1A3D64" />
          <span className="hidden md:inline text-[#1D546C]">Prev</span>
        </button>
        <button
          className="flex items-center gap-1 hover:bg-[#F4F4F4] text-[#0C2B4E] p-1 rounded-full transition-colors"
          onClick={() => go(1)}
          aria-label="Next Month"
          style={{ background: 'none', border: 'none' }}
        >
          <span className="hidden md:inline text-[#1D546C]">Next</span>
          <MdChevronRight size={28} color="#1A3D64" />
        </button>
      </div>
    </div>
  )
}
