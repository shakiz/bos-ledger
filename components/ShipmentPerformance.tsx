"use client"

import React from 'react'
import { MdBarChart, MdArrowForward } from 'react-icons/md'
import Modal from './Modal'
import dayjs from 'dayjs'
import Link from 'next/link'

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
    const [selectedShipment, setSelectedShipment] = React.useState<ShipmentData | null>(null)

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
                    <Link
                        href="/shipments"
                        className="group inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    >
                        <span>See All</span>
                        <MdArrowForward className="group-hover:translate-x-1 transition-transform" size={16} />
                    </Link>
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
                        </div>
                    </div>

                    {/* Transactions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
                        {dates.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                                No transactions for this shipment
                            </div>
                        ) : (
                            dates.map(date => {
                                const dayTransactions = groupedTransactions[date]
                                let dayIn = 0
                                let dayOut = 0

                                dayTransactions.forEach(tx => {
                                    const amt = typeof tx.amount === 'string' ? parseFloat(tx.amount) : Number(tx.amount)
                                    if (tx.type === 'IN') dayIn += amt
                                    else dayOut += amt
                                })

                                return (
                                    <div
                                        key={date}
                                        className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all"
                                    >
                                        <div className="text-sm text-slate-600 font-semibold mb-2">{dayjs(date).format('YYYY-MM-DD')}</div>
                                        <div className="text-xs text-slate-500 mb-2">{dayTransactions.length} transaction{dayTransactions.length > 1 ? 's' : ''}</div>

                                        <div className="flex items-center justify-between text-sm mb-0.5">
                                            <div className="text-emerald-600">In:</div>
                                            <div className="text-emerald-700 font-medium">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                                    +{fmt(dayIn)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <div className="text-rose-600">Out:</div>
                                            <div className="text-rose-700 font-medium">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                                                    -{fmt(dayOut)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="border-t pt-2 mt-1">
                                            <div className="text-base font-bold text-slate-900">৳{fmt(dayIn - dayOut)}</div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}
