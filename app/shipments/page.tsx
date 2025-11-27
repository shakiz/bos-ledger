import ShipmentPerformance from '@/components/ShipmentPerformance'
import { prisma } from '@/lib/prisma'
import { toNumber } from '@/lib/ledger'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'

export default async function ShipmentsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    // Fetch all entries with shipment data
    let entries = []
    try {
        entries = await prisma.ledgerEntry.findMany({
            orderBy: { date: 'asc' },
            include: { shipment: true }
        })
    } catch (err) {
        console.warn('Prisma client missing relation; falling back.', err)
        entries = await prisma.ledgerEntry.findMany({ orderBy: { date: 'asc' } })
    }

    // Calculate shipment-wise performance
    const shipmentMap = new Map<string, { id: string; name: string; invested: number; collected: number; transactions: any[] }>()

    for (const entry of entries as any[]) {
        if (!entry.shipment) continue

        const shipmentId = entry.shipment.id
        if (!shipmentMap.has(shipmentId)) {
            shipmentMap.set(shipmentId, {
                id: shipmentId,
                name: entry.shipment.name,
                invested: 0,
                collected: 0,
                transactions: []
            })
        }

        const shipmentData = shipmentMap.get(shipmentId)!
        const amt = toNumber(entry.amount)

        if (entry.type === 'OUT') {
            shipmentData.invested += amt
        } else {
            shipmentData.collected += amt
        }

        // Add transaction to shipment's transaction list
        shipmentData.transactions.push({
            ...entry,
            amount: entry.amount && typeof entry.amount === 'object' && entry.amount.toString ? entry.amount.toString() : String(entry.amount),
            date: entry.date instanceof Date ? entry.date.toISOString() : String(entry.date),
        })
    }

    const shipmentPerformance = Array.from(shipmentMap.values()).map(s => ({
        ...s,
        net: s.collected - s.invested
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
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">All Shipments</h1>
                        <p className="text-sm text-slate-500 mt-1">Complete shipment performance overview</p>
                    </div>
                </div>

                {/* Shipment Performance */}
                <ShipmentPerformance shipments={shipmentPerformance} />
            </div>
        </div>
    )
}
