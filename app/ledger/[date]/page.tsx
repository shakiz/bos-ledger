import { prisma } from '@/lib/prisma'
import AddEntryForm from '@/components/AddEntryForm'
import LedgerTable from '@/components/LedgerTable'
import dayjs from 'dayjs'

export default async function DayPage({ params }: { params: { date: string } }) {
  const dateParam = params.date // expected YYYY-MM-DD
  const start = dayjs(dateParam).startOf('day').toDate()
  const end = dayjs(dateParam).endOf('day').toDate()
  // fetch entries for the day. We avoid relational include here to prevent Prisma include/type issues
  const entries = await prisma.ledgerEntry.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'asc' } })
  // serialize Decimal amounts before sending to client components
  const safeEntries = entries.map((e: any) => ({ ...e, amount: e.amount?.toString ? e.amount.toString() : String(e.amount), shipmentId: e.shipmentId || null }))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Entries for {dateParam}</h2>
        <AddEntryForm defaultDate={dateParam} />
      </div>

      <div className="card">
  <LedgerTable entries={safeEntries} />
      </div>
    </div>
  )
}
