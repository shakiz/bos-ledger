"use client"

import { useRouter } from 'next/navigation'
import React from 'react'

interface ViewAllButtonProps {
    month: string
}

export default function ViewAllButton({ month }: ViewAllButtonProps) {
    const router = useRouter()
    const [isNavigating, setIsNavigating] = React.useState(false)

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsNavigating(true)
        router.push(`/transactions?month=${month}`)
    }

    return (
        <button
            onClick={handleClick}
            disabled={isNavigating}
            className="group inline-flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span>{isNavigating ? 'Loading...' : 'View All'}</span>
        </button>
    )
}
