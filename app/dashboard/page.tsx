import MonthSelector from '@/components/MonthSelector'
import SummaryCards from '@/components/SummaryCards'
import AddEntryForm from '@/components/AddEntryForm'
import TransactionLog from '@/components/TransactionLog'
import DailySnapshots from '@/components/DailySnapshots'
import { prisma } from '@/lib/prisma'
import { calculateMonthlySummary, getCarryForwardBalance } from '@/lib/ledger'
import dayjs from 'dayjs'
import { toNumber } from '@/lib/ledger'

export default async function DashboardPage({ searchParams }: { searchParams?: { month?: string } }) {
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
    allEntries = await prisma.ledgerEntry.findMany({ orderBy: { date: 'asc' } })
    allSummary = calculateMonthlySummary(allEntries)
  } catch (err) {
    // fallback if client not regenerated
    // eslint-disable-next-line no-console
    console.warn('Prisma client missing relation for allEntries; falling back.', err)
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 bg-[#0C2B4E] text-[#F4F4F4] p-4 rounded-lg">
        <h1 className="text-2xl font-semibold">Shipment Cash Flow Manager</h1>
        <div className="flex flex-col items-end">
          <div className="text-sm font-medium mb-1">All-Time Totals</div>
          <SummaryCards totalIn={allSummary.totalIn} totalOut={allSummary.totalOut} finalBalance={allSummary.finalBalance} />
        </div>
      </div>

      {/* Daily snapshots at the top, full width */}
      <div className="card mb-6 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#0C2B4E]">Daily Snapshots</h3>
          <div className="text-sm text-gray-500">End of day balances</div>
        </div>
        <DailySnapshots entries={(entries as any[]).map(e => ({
          ...e,
          amount: e.amount && typeof e.amount === 'object' && e.amount.toString ? e.amount.toString() : String(e.amount),
          date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
          shipment: (e as any).shipment ? { id: (e as any).shipment.id, name: (e as any).shipment.name } : null,
        }))} />
      </div>


      {/* Month selector and carry forward/summary in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <MonthSelector currentMonth={month} />
        </div>
        <div className="md:col-span-2">
          <div className="card p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm text-[#1D546C]">Carry Forward</div>
                <div className="text-2xl font-bold text-[#0C2B4E]">৳{carryForward.toFixed(2)}</div>
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

      {/* Add Transaction form below the month/carry forward section */}
      <div className="card mb-6">
        <h3 className="text-sm font-medium mb-2">Add Transaction</h3>
        <AddEntryForm />
      </div>

      {/* Detailed transaction log below the summary */}
      <div className="mt-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Detailed Transaction Log</h3>
          <TransactionLog entries={entriesWithRunning} />
        </div>
      </div>
    </div>
  )
}
