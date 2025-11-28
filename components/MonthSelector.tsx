"use client"
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import dayjs from 'dayjs'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export default function MonthSelector({ currentMonth }: { currentMonth?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const month = currentMonth ?? sp?.get('month') ?? dayjs().format('YYYY-MM')
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)

  function go(delta: number) {
    const next = dayjs(month + '-01').add(delta, 'month').format('YYYY-MM')
    setIsNavigating(true)
    startTransition(() => {
      // Stay on the current page, just change the month parameter
      router.push(`${pathname}?month=${next}`)
    })
    // Reset after a short delay to handle edge cases
    setTimeout(() => setIsNavigating(false), 1000)
  }

  const loading = isPending || isNavigating

  return (
    <div>
      <div className="inline-flex items-center bg-white border border-slate-200 rounded-full shadow-sm px-2 py-1">
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => go(-1)}
          disabled={loading}
          aria-label="Previous Month"
        >
          <MdChevronLeft size={20} />
        </button>
        <div className="px-3 text-sm font-medium text-slate-700 min-w-[120px] text-center">
          {loading ? (
            <span className="opacity-60">Loading...</span>
          ) : (
            dayjs(month + '-01').format('MMMM YYYY')
          )}
        </div>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => go(1)}
          disabled={loading}
          aria-label="Next Month"
        >
          <MdChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
