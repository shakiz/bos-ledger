"use client"
import React from 'react'

export default function Modal({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black opacity-30" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-md z-10 w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl border border-slate-200 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">Transaction Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            ✕ Close
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
