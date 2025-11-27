import MonthSelector from '@/components/MonthSelector'
import SummaryCards from '@/components/SummaryCards'
import AddEntryForm from '@/components/AddEntryForm'
import TransactionLog from '@/components/TransactionLog'
import DailySnapshots from '@/components/DailySnapshots'
import ShipmentPerformance from '@/components/ShipmentPerformance'
import { prisma } from '@/lib/prisma'
import { calculateMonthlySummary, getCarryForwardBalance } from '@/lib/ledger'
import dayjs from 'dayjs'
import { toNumber } from '@/lib/ledger'
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import LogoutButton from "@/components/LogoutButton"
import { redirect } from "next/navigation"

export default async function DashboardPage({ searchParams }: { searchParams?: { month?: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // MODERATOR VIEW
  if ((session.user as any).role === "MODERATOR") {
    return (
      <div>
        <div className="mb-6 p-4 rounded-lg bg-indigo-600 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Shipment Cash Flow Manager</h1>
              <div className="text-sm text-indigo-100">Moderator View</div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-indigo-100">Welcome</div>
                <div className="text-lg font-bold text-white">{session.user?.email}</div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>

        <div className="card p-12 text-center text-gray-500">
          <h2 className="text-xl font-semibold mb-2">Dashboard is Empty</h2>
          <p>You do not have permission to view financial data.</p>
        </div>
      </div>
    )
  }

  // ADMIN VIEW (Existing Logic)
  const month = searchParams?.month ?? dayjs().format('YYYY-MM')
  const start = dayjs(month + '-01').startOf('month').toDate()
  const end = dayjs(month + '-01').endOf('month').toDate()

  let entries = []
  try {
    // include shipment relation so client can display shipment.name
    entries = await prisma.ledgerEntry.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'asc' }, include: { shipment: true } })
  } catch (err) {
    // Fallback when Prisma client is outdated and doesn't include the relation
    // Try again without include so the page can still render. Prompt user to run `npx prisma generate`.
    // eslint-disable-next-line no-console
    console.warn('Prisma client missing relation; falling back to fetch without include. Run `npx prisma generate` to regenerate client.', err)
    entries = await prisma.ledgerEntry.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'asc' } })
  }


  // all-time totals and carry-forward
  let allEntries: any[] = []
  let allSummary: { totalIn: number; totalOut: number; finalBalance: number; daily: any[] } = { totalIn: 0, totalOut: 0, finalBalance: 0, daily: [] }
  try {
    allEntries = await prisma.ledgerEntry.findMany({ orderBy: { date: 'asc' }, include: { shipment: true } })
    allSummary = calculateMonthlySummary(allEntries)
  } catch (err) {
    // fallback if client not regenerated
    // eslint-disable-next-line no-console
    console.warn('Prisma client missing relation for allEntries; falling back.', err)
    allEntries = await prisma.ledgerEntry.findMany({ orderBy: { date: 'asc' } })
    allSummary = calculateMonthlySummary(allEntries)
  }

  const carryForward = getCarryForwardBalance(allEntries, month)
  const summary = calculateMonthlySummary(entries)

  // compute running balances per entry (start from carryForward)
  const sortedEntries = (entries as any[]).slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let running = carryForward
  const entriesWithRunning = sortedEntries.map(e => {
    const amt = toNumber(e.amount)
    if (e.type === 'IN') running += amt
    else running -= amt
    // serialize amount and shipment to plain JS types to avoid Decimal/Date issues when passing to client
    return {
      ...e,
      amount: e.amount && typeof e.amount === 'object' && e.amount.toString ? e.amount.toString() : String(e.amount),
      date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
      shipment: e.shipment ? { id: e.shipment.id, name: e.shipment.name } : null,
      runningBalance: running,
    }
  })

  // Calculate shipment-wise performance using ALL entries (not just current month)
  const shipmentMap = new Map<string, { id: string; name: string; invested: number; collected: number; transactions: any[] }>()

  for (const entry of allEntries as any[]) {
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
    <div>
      {/* Top bar: title + subtitle left, available balance right */}
      <div className="mb-6 p-4 md:p-6 rounded-lg bg-indigo-600 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title Section */}
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-semibold">Shipment Cash Flow Manager</h1>
            <div className="text-xs md:text-sm text-indigo-100 mt-1">Shipments and cash flow overview</div>
          </div>

          {/* Balance and Logout Section */}
          <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6">
            <div className="text-left md:text-right">
              <div className="text-xs md:text-sm text-indigo-100">Available Balance</div>
              <div className="text-xl md:text-2xl font-bold text-white">৳{allSummary.finalBalance.toFixed(2)}</div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Month selector at left, separator, carry forward + monthly summary at right */}
      <div className="mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-6 flex-col sm:flex-row">
            <div className="flex items-center gap-6">
              <div>
                <MonthSelector currentMonth={month} />
              </div>
              <div className="hidden sm:block h-10 border-l border-gray-200" />
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Carry Forward</div>
                  <div className="text-lg font-bold text-[#1D546C]">৳{carryForward.toFixed(2)}</div>
                </div>
                <div className="flex-1">
                  <SummaryCards
                    totalIn={summary.totalIn}
                    totalOut={summary.totalOut}
                    finalBalance={summary.finalBalance}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shipment Performance Section */}
      <div className="mb-6">
        <ShipmentPerformance shipments={shipmentPerformance} limit={3} showSeeAll={true} />
      </div>

      {/* Daily snapshots at the top, full width */}
      <div className="mb-6">
        <DailySnapshots entries={(entries as any[]).map(e => ({
          ...e,
          amount: e.amount && typeof e.amount === 'object' && e.amount.toString ? e.amount.toString() : String(e.amount),
          date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
          shipment: (e as any).shipment ? { id: (e as any).shipment.id, name: (e as any).shipment.name } : null,
        }))} limit={5} showSeeAll={true} />
      </div>

      {/* Detailed transaction log below the summary */}
      <div className="mt-6">
        <div className="card">
          <TransactionLog entries={entriesWithRunning} />
        </div>
      </div>
    </div>
  )
}
