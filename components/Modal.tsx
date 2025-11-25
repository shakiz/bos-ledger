"use client"
import React from 'react'

export default function Modal({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
  <div className="bg-white rounded-xl shadow-md p-4 z-10 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl border border-slate-200 overflow-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
