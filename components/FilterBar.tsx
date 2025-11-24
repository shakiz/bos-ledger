"use client"
import React from 'react'

export default function FilterBar({ categories, shipments, filter, setFilter }: {
  categories: string[]
  shipments: { id: string; name: string }[]
  filter: { category: string; shipmentId: string }
  setFilter: (f: { category: string; shipmentId: string }) => void
}) {
  return (
    <div className="flex gap-4 mb-4 items-center">
      <div>
        <label className="text-sm text-gray-600">Category</label>
        <select className="border rounded px-2 py-1 ml-2" value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })}>
          <option value="">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <label className="text-sm text-gray-600">Shipment</label>
        <select className="border rounded px-2 py-1 ml-2" value={filter.shipmentId} onChange={e => setFilter({ ...filter, shipmentId: e.target.value })}>
          <option value="">All</option>
          {shipments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
    </div>
  )
}