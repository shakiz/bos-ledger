"use client"

import React from 'react'
import { MdBarChart, MdArrowForward } from 'react-icons/md'
import Modal from './Modal'
import dayjs from 'dayjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ShipmentData {
    id: string
    name: string
    invested: number
    collected: number
    net: number
    transactions?: any[]
}

interface ShipmentPerformanceProps {
    shipments: ShipmentData[]
    limit?: number
    showSeeAll?: boolean
}

export default function ShipmentPerformance({ shipments, limit, showSeeAll = false }: ShipmentPerformanceProps) {
    const router = useRouter()
    const [selectedShipment, setSelectedShipment] = React.useState<ShipmentData | null>(null)
    const [isNavigating, setIsNavigating] = React.useState(false)

    const fmt = (n: number) => {
        if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)
    }

    // Group transactions by date for the selected shipment
    const groupedTransactions = React.useMemo(() => {
        if (!selectedShipment?.transactions) return {}

        const grouped: Record<string, any[]> = {}
        selectedShipment.transactions.forEach(tx => {
            const date = dayjs(tx.date).format('YYYY-MM-DD')
            if (!grouped[date]) grouped[date] = []
            grouped[date].push(tx)
        })
        return grouped
    }, [selectedShipment])

    const dates = Object.keys(groupedTransactions).sort()

    // Apply limit if specified
    const displayedShipments = limit ? shipments.slice(0, limit) : shipments
    const hasMore = limit && shipments.length > limit

    const handleSeeAllClick = (e: React.MouseEvent) => {
        e.preventDefault()
        setIsNavigating(true)
        router.push('/shipments')
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MdBarChart className="text-indigo-600" size={24} />
                    <h2 className="text-lg md:text-xl font-semibold text-slate-800">Shipment Performance</h2>
                </div>

                {/* See All Button - Always visible when showSeeAll is true */}
                {showSeeAll && (
                    <button
                        onClick={handleSeeAllClick}
                        disabled={isNavigating}
                        className="group inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span>{isNavigating ? 'Loading...' : 'See All'}</span>
                        {!isNavigating && <MdArrowForward className="group-hover:translate-x-1 transition-transform" size={16} />}
                    </button>
                )}
            </div>

            {/* Shipment Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedShipments.length === 0 ? (
                    <div className="col-span-full text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        No shipment data available
                    </div>
                ) : (
                    displayedShipments.map((shipment) => {
                        const isProfit = shipment.net >= 0
                        const profitLabel = isProfit ? 'NET PROFIT' : 'NET LOSS'
                        const profitColor = isProfit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'

                        return (
                            <div
                                key={shipment.id}
                                onClick={() => setSelectedShipment(shipment)}
                                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
                            >
                                {/* Shipment Name and Status Badge */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <MdBarChart className="text-indigo-500" size={20} />
                                        <span className="font-semibold text-slate-800">{shipment.name}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${profitColor}`}>
                                        {profitLabel}
                                    </span>
                                </div>

                                {/* Invested and Collected */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Invested (Out)</span>
                                        <span className="text-rose-600 font-medium">৳ {fmt(shipment.invested)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Collected (In)</span>
                                        <span className="text-emerald-600 font-medium">৳ {fmt(shipment.collected)}</span>
                                    </div>
                                </div>

                                {/* Net Amount */}
                                <div className="pt-3 border-t border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-slate-700">Net</span>
                                        <span className={`text-base font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {isProfit ? '+' : ''}৳ {fmt(shipment.net)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Shipment Transactions Modal */}
            <Modal open={!!selectedShipment} onClose={() => setSelectedShipment(null)}>
                <div>
                    <div className="mb-4">
                        <h3 className="text-lg md:text-xl font-semibold text-slate-800 mb-1">
                            {selectedShipment?.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm">
                            <span className="text-emerald-600 font-medium">Collected: +৳{fmt(selectedShipment?.collected || 0)}</span>
                            <span className="text-rose-600 font-medium">Invested: -৳{fmt(selectedShipment?.invested || 0)}</span>
                            <span className={`font-semibold ${(selectedShipment?.net || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                Net: {(selectedShipment?.net || 0) >= 0 ? '+' : ''}৳{fmt(selectedShipment?.net || 0)}
                            </span>
                            <span className="text-slate-500">({selectedShipment?.transactions?.length || 0} transaction{(selectedShipment?.transactions?.length || 0) !== 1 ? 's' : ''})</span>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="max-h-[60vh] overflow-y-auto">
                        {!selectedShipment?.transactions || selectedShipment.transactions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                                No transactions for this shipment
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <table className="w-full border-collapse">
                                        <thead className="sticky top-0 bg-slate-50 border-b-2 border-slate-200">
                                            <tr>
                                                <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Date</th>
                                                <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Type</th>
                                                <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Category</th>
                                                <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Description</th>
                                                <th className="text-right text-xs font-semibold text-slate-600 px-3 py-3">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedShipment.transactions.map((tx: any, idx: number) => {
                                                const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount)
                                                const isIn = tx.type === 'IN'

                                                return (
                                                    <tr
                                                        key={tx.id || idx}
                                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                                    >
                                                        <td className="px-3 py-3 text-sm text-slate-700">
                                                            {dayjs(tx.date).format('MMM D, YYYY')}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                                }`}>
                                                                {isIn ? 'IN' : 'OUT'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-slate-600">
                                                            {tx.category || '-'}
                                                        </td>
                                                        <td className="px-3 py-3 text-sm text-slate-700">
                                                            {tx.description || '-'}
                                                        </td>
                                                        <td className={`px-3 py-3 text-sm font-semibold text-right ${isIn ? 'text-emerald-600' : 'text-rose-600'
                                                            }`}>
                                                            {isIn ? '+' : '-'}৳{fmt(amt)}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-3">
                                    {selectedShipment.transactions.map((tx: any, idx: number) => {
                                        const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount)
                                        const isIn = tx.type === 'IN'

                                        return (
                                            <div
                                                key={tx.id || idx}
                                                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-sm font-medium text-slate-700">
                                                        {dayjs(tx.date).format('MMM D, YYYY')}
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                        {isIn ? 'IN' : 'OUT'}
                                                    </span>
                                                </div>

                                                {tx.category && (
                                                    <div className="text-xs text-slate-500 mb-1">
                                                        Category: {tx.category}
                                                    </div>
                                                )}

                                                {tx.description && (
                                                    <div className="text-sm text-slate-700 mb-2">
                                                        {tx.description}
                                                    </div>
                                                )}

                                                <div className={`text-base font-bold text-right ${isIn ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}>
                                                    {isIn ? '+' : '-'}৳{fmt(amt)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
