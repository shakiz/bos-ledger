"use client"
import React from 'react'
import Modal from './Modal'

export default function CreateCategoryModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (name: string) => void }) {
  const [name, setName] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    try {
      onCreated(name.trim())
      setName('')
      onClose()
    } catch (err) {
      console.error(err)
      alert('Create category failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-[#F4F4F4] p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-[#0C2B4E]">Create Category</h3>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" className="w-full border border-[#1A3D64] rounded px-2 py-2 mb-3 bg-white text-[#0C2B4E]" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 border border-[#1A3D64] rounded text-[#1A3D64] bg-white hover:bg-[#F4F4F4]">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="px-4 py-2 bg-[#0C2B4E] text-[#F4F4F4] rounded hover:bg-[#1A3D64]">Create</button>
        </div>
      </div>
    </Modal>
  )
}
