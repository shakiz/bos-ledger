import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  date: z.string().optional(),
  type: z.enum(['IN', 'OUT']).optional(),
  amount: z.number().nonnegative().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  shipmentId: z.string().nullable().optional()
})

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 })

  const dataToUpdate: any = { ...parsed.data }
  if (parsed.data.date) dataToUpdate.date = new Date(parsed.data.date)
  // handle nullable shipmentId -> set null to unlink
  if (Object.prototype.hasOwnProperty.call(parsed.data, 'shipmentId')) {
    dataToUpdate.shipmentId = parsed.data.shipmentId === null ? null : parsed.data.shipmentId
  }
  // update without relational include. Return updated entry with serialized amount and shipmentId.
  const updated = await prisma.ledgerEntry.update({ where: { id }, data: dataToUpdate, include: { shipment: true } })
  return NextResponse.json({
    ...updated,
    amount: updated.amount?.toString ? updated.amount.toString() : String(updated.amount),
    shipmentId: updated.shipmentId || null,
    shipment: updated.shipment ? { id: updated.shipment.id, name: updated.shipment.name } : null
  })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = params.id
  await prisma.ledgerEntry.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
