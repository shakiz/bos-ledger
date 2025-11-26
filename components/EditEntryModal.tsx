"use client"
import React from 'react'
import Modal from './Modal'
import CreateShipmentModal from './CreateShipmentModal'
import CreateCategoryModal from './CreateCategoryModal'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MdAddCircle } from 'react-icons/md'

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
  const [isSaving, setIsSaving] = React.useState(false)

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
      fetch(`/api/ledger?month=${new Date().toISOString().slice(0, 7)}`).then(r => r.json()).then(d => d.entries ?? []).catch(() => [])
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
    setIsSaving(true)
    try {
      await fetch(`/api/ledger/${entry.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, shipmentId: data.shipmentId ? data.shipmentId : null }) })
      // Close the edit modal but keep parent modal open
      onClose()
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Update failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">

          {/* responsive controls: stack on small screens, 2-per-row on md, 3-per-row on lg */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

            {/* Date */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                {...register('date')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
              <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="text-[#1D546C] mr-2">৳</span>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="w-full outline-none text-lg text-slate-700"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select
                {...register('type')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="IN">Money In (+)</option>
                <option value="OUT">Money Out (-)</option>
              </select>
            </div>

            {/* Shipment Ref */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Shipment Ref</label>
              <div className="flex items-center gap-2">
                <select
                  {...register('shipmentId')}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">None</option>
                  {shipments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setOpenShipmentModal(true)}
                  className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                  aria-label="Add shipment"
                >
                  <MdAddCircle size={22} />
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <div className="flex items-center gap-2">
                <select
                  {...register('category')}
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setOpenCategoryModal(true)}
                  className="p-2 text-[#1A3D64] hover:bg-[#F4F4F4] rounded-lg"
                  aria-label="Add category"
                >
                  <MdAddCircle size={22} />
                </button>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <input
                {...register('description')}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. Factory Payment"
              />
            </div>

          </div>

          {/* SUBMIT */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>

        </div>
      </form>
      <CreateShipmentModal open={openShipmentModal} onClose={() => setOpenShipmentModal(false)} onCreated={(s: any) => { setShipments(prev => [s, ...prev]); setValue('shipmentId', s.id) }} />
      <CreateCategoryModal open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} onCreated={(name) => { setCategories(prev => [name, ...prev]); setValue('category', name) }} />
    </Modal>
  )
}
