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
      <div className="inline-flex items-center bg-white border border-slate-200 rounded-full shadow-sm px-2 py-1">
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors text-slate-700"
          onClick={() => go(-1)}
          aria-label="Previous Month"
        >
          <MdChevronLeft size={20} />
        </button>
        <div className="px-3 text-sm font-medium text-slate-700">{dayjs(month + '-01').format('MMMM YYYY')}</div>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors text-slate-700"
          onClick={() => go(1)}
          aria-label="Next Month"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
