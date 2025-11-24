import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import dayjs from 'dayjs'

const createSchema = z.object({
  date: z.string(), // ISO date
  type: z.enum(['IN', 'OUT']),
  amount: z.number().nonnegative(),
  category: z.string().min(1),
  description: z.string().optional(),
  shipmentId: z.string().optional()
})

export async function GET(req: Request) {
  const url = new URL(req.url)
  const month = url.searchParams.get('month') || dayjs().format('YYYY-MM')
  const start = dayjs(month + '-01').startOf('month').toDate()
  const end = dayjs(month + '-01').endOf('month').toDate()

  // fetch entries (without relational include). We intentionally do not attach full shipment objects here
  // to avoid compile-time Prisma include/type issues in environments where the client may be out of sync.
  const entries = await prisma.ledgerEntry.findMany({ where: { date: { gte: start, lte: end } }, orderBy: { date: 'asc' } })
  // convert Decimal to string for transport and keep shipmentId for client-side mapping
  const safe = entries.map((e: any) => ({ ...e, amount: e.amount?.toString ? e.amount.toString() : String(e.amount), shipmentId: e.shipmentId || null }))
  return NextResponse.json({ entries: safe })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })

  const { date, type, amount, category, description, shipmentId } = parsed.data
  let created: any
  // create without relational include; return created entry with amount serialized and shipmentId for client-side mapping
  created = await prisma.ledgerEntry.create({ data: { date: new Date(date), type, amount: amount, category, description, shipmentId: shipmentId || undefined } })
  return NextResponse.json({ ...created, amount: created.amount?.toString ? created.amount.toString() : String(created.amount), shipmentId: created.shipmentId || null })
}
