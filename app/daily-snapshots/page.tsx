import DailySnapshots from '@/components/DailySnapshots'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import dayjs from 'dayjs'

export default async function DailySnapshotsPage({ searchParams }: { searchParams?: { month?: string } }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Get month from query params or default to current month
    const month = searchParams?.month ?? dayjs().format('YYYY-MM')
    const start = dayjs(month + '-01').startOf('month').toDate()
    const end = dayjs(month + '-01').endOf('month').toDate()

    // Fetch all entries for the selected month with shipment data
    let entries = []
    try {
        entries = await prisma.ledgerEntry.findMany({
            where: { date: { gte: start, lte: end } },
            orderBy: { date: 'desc' },
            include: { shipment: true }
        })
    } catch (err) {
        console.warn('Prisma client missing relation; falling back.', err)
        entries = await prisma.ledgerEntry.findMany({
            where: { date: { gte: start, lte: end } },
            orderBy: { date: 'desc' }
        })
    }

    // Serialize entries for client component
    const serializedEntries = (entries as any[]).map(e => ({
        ...e,
        amount: e.amount && typeof e.amount === 'object' && e.amount.toString ? e.amount.toString() : String(e.amount),
        date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
        shipment: e.shipment ? { id: e.shipment.id, name: e.shipment.name } : null,
    }))

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
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">All Daily Snapshots</h1>
                        <p className="text-sm text-slate-500 mt-1">Complete daily transaction overview for {dayjs(month).format('MMMM YYYY')}</p>
                    </div>
                </div>

                {/* Daily Snapshots */}
                <DailySnapshots entries={serializedEntries} />
            </div>
        </div>
    )
}
