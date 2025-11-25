"use client"
import React from 'react'
import Modal from './Modal'
import CreateShipmentModal from './CreateShipmentModal'
import CreateCategoryModal from './CreateCategoryModal'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  date: z.string(),
  type: z.enum(['IN', 'OUT']),
  amount: z.number().min(0.01),
  category: z.string().min(1),
  description: z.string().optional(),
  shipmentId: z.string().nullable().optional()
})

type FormData = z.infer<typeof schema>

export default function EditEntryModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: any }) {
  const router = useRouter()
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const [shipments, setShipments] = React.useState<{ id: string; name: string }[]>([])

  React.useEffect(() => {
    if (!entry) return
    // entry.date can be Date or string; normalize to YYYY-MM-DD
    const dateStr = entry.date && typeof entry.date === 'string' ? entry.date : (entry.date instanceof Date ? entry.date.toISOString() : new Date(entry.date).toISOString())
    setValue('date', dateStr.slice(0, 10))
    setValue('type', entry.type)
    setValue('amount', Number(entry.amount))
    setValue('category', entry.category)
    setValue('description', entry.description ?? '')
    setValue('shipmentId', entry.shipment ? entry.shipment.id : null)
  }, [entry, setValue])

  // fetch shipments and categories (derive categories from entries)
  React.useEffect(() => {
    let mounted = true
    Promise.all([
      fetch('/api/shipments').then(r => r.json()).then(d => d.shipments ?? []).catch(() => []),
      fetch(`/api/ledger?month=${new Date().toISOString().slice(0,7)}`).then(r => r.json()).then(d => d.entries ?? []).catch(() => [])
    ]).then(([shipData, entriesData]) => {
      if (!mounted) return
      setShipments(shipData)
      const cats = Array.from(new Set((entriesData as any[]).map((e: any) => e.category).filter(Boolean))) as string[]
      setCategories(cats)
    })
    return () => { mounted = false }
  }, [])

  const [categories, setCategories] = React.useState<string[]>([])

  function createCategory() {
    const name = window.prompt('New category name')
    if (!name) return
    setCategories(prev => [name, ...prev])
    setValue('category', name)
  }

  const [openShipmentModal, setOpenShipmentModal] = React.useState(false)
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false)

  async function onSubmit(data: FormData) {
    try {
      await fetch(`/api/ledger/${entry.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, shipmentId: data.shipmentId ? data.shipmentId : null }) })
      // close the edit modal and refresh data without full reload so parent modal can remain open
      onClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Update failed')
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="border rounded px-2 py-2" {...register('date')} />
          <select className="border rounded px-2 py-2" {...register('type')}>
            <option value="IN">Money In (+)</option>
            <option value="OUT">Money Out (-)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input type="number" step="0.01" className="border rounded px-2 py-2" {...register('amount', { valueAsNumber: true })} />
          <div>
            <label className="text-sm text-gray-600">Category</label>
            <div className="flex gap-2 mt-1">
              <select className="border rounded px-2 py-2 w-full" {...register('category')}>
                <option value="">-- Select --</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button type="button" onClick={() => setOpenCategoryModal(true)} className="px-3 py-2 border rounded">New</button>
            </div>
          </div>
        </div>

        <div>
          <input className="border rounded px-2 py-2 w-full" {...register('description')} />
        </div>

            <div>
              <label className="text-sm text-gray-600">Shipment</label>
              <div className="flex gap-2 mt-1">
                <select className="border rounded px-2 py-2 w-full" {...register('shipmentId')}>
                  <option value="">-- None --</option>
                  {shipments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button type="button" onClick={() => setOpenShipmentModal(true)} className="px-3 py-2 border rounded">New</button>
              </div>
            </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-2 border rounded">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </form>
      <CreateShipmentModal open={openShipmentModal} onClose={() => setOpenShipmentModal(false)} onCreated={(s:any) => { setShipments(prev => [s, ...prev]); setValue('shipmentId', s.id) }} />
      <CreateCategoryModal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} onCreated={(name) => { setCategories(prev => [name, ...prev]); setValue('category', name) }} />
    </Modal>
  )
}
