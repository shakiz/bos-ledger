import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({ name: z.string().min(1) })

export async function GET() {
  const shipments = await prisma.shipment.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ shipments })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })

  const created = await prisma.shipment.create({ data: { name: parsed.data.name } })
  return NextResponse.json(created)
}
