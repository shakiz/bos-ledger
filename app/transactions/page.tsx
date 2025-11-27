import MonthSelector from '@/components/MonthSelector'
import SummaryCards from '@/components/SummaryCards'
import { prisma } from '@/lib/prisma'
import { calculateMonthlySummary, getCarryForwardBalance, toNumber } from '@/lib/ledger'
import dayjs from 'dayjs'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'

export default async function TransactionsPage({ searchParams }: { searchParams?: { month?: string } }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Get month from query params or default to current month
    const month = searchParams?.month ?? dayjs().format('YYYY-MM')
    const start = dayjs(month + '-01').startOf('month').toDate()
    const end = dayjs(month + '-01').endOf('month').toDate()

    // Fetch entries for the selected month
    let entries = []
    try {
        entries = await prisma.ledgerEntry.findMany({
            where: { date: { gte: start, lte: end } },
            orderBy: { date: 'asc' },
            include: { shipment: true }
        })
    } catch (err) {
        console.warn('Prisma client missing relation; falling back.', err)
        entries = await prisma.ledgerEntry.findMany({
            where: { date: { gte: start, lte: end } },
            orderBy: { date: 'asc' }
        })
    }

    // Fetch all entries for carry-forward calculation
    let allEntries: any[] = []
    try {
        allEntries = await prisma.ledgerEntry.findMany({ orderBy: { date: 'asc' } })
    } catch (err) {
        console.warn('Error fetching all entries', err)
    }

    // Calculate carry-forward balance from previous months
    const carryForward = getCarryForwardBalance(allEntries, month)

    // Calculate current month summary
    const summary = calculateMonthlySummary(entries)

    // Compute running balances per entry (start from carryForward)
    const sortedEntries = (entries as any[]).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let running = carryForward
    const entriesWithRunning = sortedEntries.map(e => {
        const amt = toNumber(e.amount)
        if (e.type === 'IN') running += amt
        else running -= amt

        return {
            ...e,
            amount: e.amount && typeof e.amount === 'object' && e.amount.toString ? e.amount.toString() : String(e.amount),
            date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
            shipment: e.shipment ? { id: e.shipment.id, name: e.shipment.name } : null,
            runningBalance: running,
        }
    })

    const fmt = (n: number) => {
        if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all border border-slate-200 bg-white"
                    >
                        <MdArrowBack size={24} className="text-slate-700" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Monthly Transactions</h1>
                        <p className="text-sm text-slate-500 mt-1">View all transactions for {dayjs(month).format('MMMM YYYY')}</p>
                    </div>
                </div>

                {/* Month Selector */}
                <div className="card mb-6">
                    <MonthSelector currentMonth={month} />
                </div>

                {/* Carry Forward Balance */}
                {carryForward !== 0 && (
                    <div className="card mb-6 bg-slate-50 border-2 border-slate-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-slate-600">Carry Forward from Previous Months</h3>
                                <p className="text-xs text-slate-500 mt-1">Balance brought forward to {dayjs(month).format('MMMM YYYY')}</p>
                            </div>
                            <div className={`text-2xl font-bold ${carryForward >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {carryForward >= 0 ? '+' : ''}৳{fmt(Math.abs(carryForward))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="mb-6">
                    <SummaryCards
                        totalIn={summary.totalIn}
                        totalOut={summary.totalOut}
                        finalBalance={carryForward + summary.totalIn - summary.totalOut}
                    />
                </div>

                {/* Transactions Table */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">All Transactions</h3>

                    {entriesWithRunning.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No transactions for this month
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                                        <tr>
                                            <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Date</th>
                                            <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Shipment</th>
                                            <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Category</th>
                                            <th className="text-left text-xs font-semibold text-slate-600 px-3 py-3">Description</th>
                                            <th className="text-right text-xs font-semibold text-emerald-600 px-3 py-3">Money In</th>
                                            <th className="text-right text-xs font-semibold text-rose-600 px-3 py-3">Money Out</th>
                                            <th className="text-right text-xs font-semibold text-slate-600 px-3 py-3">Running Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entriesWithRunning.map((entry: any, idx: number) => {
                                            const amt = typeof entry.amount === 'string' ? parseFloat(entry.amount) : Number(entry.amount)
                                            const isIn = entry.type === 'IN'

                                            return (
                                                <tr
                                                    key={entry.id || idx}
                                                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                                >
                                                    <td className="px-3 py-3 text-sm text-slate-700">
                                                        {dayjs(entry.date).format('MMM D, YYYY')}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-slate-600">
                                                        {entry.shipment?.name || '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-slate-600">
                                                        {entry.category || '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm text-slate-700">
                                                        {entry.description || '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm font-semibold text-right text-emerald-600">
                                                        {isIn ? `৳${fmt(amt)}` : '-'}
                                                    </td>
                                                    <td className="px-3 py-3 text-sm font-semibold text-right text-rose-600">
                                                        {!isIn ? `৳${fmt(amt)}` : '-'}
                                                    </td>
                                                    <td className={`px-3 py-3 text-sm font-bold text-right ${entry.runningBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                                                        }`}>
                                                        ৳{fmt(entry.runningBalance)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {entriesWithRunning.map((entry: any, idx: number) => {
                                    const amt = typeof entry.amount === 'string' ? parseFloat(entry.amount) : Number(entry.amount)
                                    const isIn = entry.type === 'IN'

                                    return (
                                        <div
                                            key={entry.id || idx}
                                            className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-sm font-medium text-slate-700">
                                                    {dayjs(entry.date).format('MMM D, YYYY')}
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isIn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {isIn ? 'IN' : 'OUT'}
                                                </span>
                                            </div>

                                            {entry.shipment?.name && (
                                                <div className="text-xs text-slate-500 mb-1">
                                                    Shipment: {entry.shipment.name}
                                                </div>
                                            )}

                                            {entry.category && (
                                                <div className="text-xs text-slate-500 mb-1">
                                                    Category: {entry.category}
                                                </div>
                                            )}

                                            {entry.description && (
                                                <div className="text-sm text-slate-700 mb-2">
                                                    {entry.description}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                                <div className={`text-base font-bold ${isIn ? 'text-emerald-600' : 'text-rose-600'
                                                    }`}>
                                                    {isIn ? '+' : '-'}৳{fmt(amt)}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs text-slate-500">Balance</div>
                                                    <div className={`text-sm font-bold ${entry.runningBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                                                        }`}>
                                                        ৳{fmt(entry.runningBalance)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
