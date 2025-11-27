"use client"
import React from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import EntryRow from './EntryRow'
import { MdChevronLeft, MdChevronRight, MdAdd } from 'react-icons/md'
import Modal from './Modal'
import AddEntryForm from './AddEntryForm'

export default function TransactionLog({ entries }: { entries: any[] }) {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = React.useState(dayjs().format('YYYY-MM-DD'))
  const [isLoading, setIsLoading] = React.useState(false)
  const [showAddModal, setShowAddModal] = React.useState(false)

  async function handleDelete(id: string) {
    if (!confirm('Delete this entry?')) return
    try {
      await fetch(`/api/ledger/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch (err) {
      console.error(err)
      alert('Delete failed')
    }
  }

  if (!entries || entries.length === 0) return <div className="text-sm text-gray-500">No transactions yet.</div>

  // Filter for selected date's transactions
  const selectedEntries = entries.filter(e => {
    const entryDate = dayjs(e.date).format('YYYY-MM-DD')
    return entryDate === selectedDate
  })

  const fmt = (n: number) => {
    if (Number.isInteger(n)) return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0 }).format(n)
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  }

  // Calculate selected date's totals
  let totalIn = 0
  let totalOut = 0
  selectedEntries.forEach(entry => {
    const amt = typeof entry.amount === "string" ? parseFloat(entry.amount) : Number(entry.amount)
    if (entry.type === "IN") totalIn += amt
    else totalOut += amt
  })

  function changeDate(delta: number) {
    setIsLoading(true)
    const newDate = dayjs(selectedDate).add(delta, 'day').format('YYYY-MM-DD')
    setSelectedDate(newDate)
    setTimeout(() => setIsLoading(false), 300)
  }

  return (
    <div className="space-y-4">
      {/* Header with Title and Add Button */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base md:text-lg font-semibold text-slate-800">Detailed Transaction Log</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="group inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <MdAdd size={18} />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Date Navigation and Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Title and Summary */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-3 text-xs md:text-sm">
              <span className="text-emerald-600 font-medium">In: +৳{fmt(totalIn)}</span>
              <span className="text-rose-600 font-medium">Out: -৳{fmt(totalOut)}</span>
              <span className="text-slate-700 font-semibold">Balance: ৳{fmt(totalIn - totalOut)}</span>
              <span className="text-slate-500">({selectedEntries.length} transaction{selectedEntries.length !== 1 ? 's' : ''})</span>
            </div>
          </div>

          {/* Date Navigation - Compact */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2 shadow-sm">
            <button
              onClick={() => changeDate(-1)}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous day"
            >
              <MdChevronLeft size={20} />
            </button>

            <div className="flex flex-col items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setIsLoading(true)
                  setSelectedDate(e.target.value)
                  setTimeout(() => setIsLoading(false), 300)
                }}
                className="text-xs md:text-sm font-medium text-slate-800 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 hidden md:block">
                {dayjs(selectedDate).format('ddd, MMM D')}
              </div>
            </div>

            <button
              onClick={() => changeDate(1)}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-slate-100 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next day"
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-slate-500">
          <div className="animate-pulse">Loading transactions...</div>
        </div>
      ) : selectedEntries.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
          No transactions for {dayjs(selectedDate).format('MMMM D, YYYY')}
        </div>
      ) : (
        <div>
          {/* DESKTOP VIEW - Table */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-full">
              {/* HEADER */}
              <div className="grid grid-cols-10 bg-slate-50 border border-slate-200 rounded-t-md text-sm text-slate-600 px-4 py-3 items-center">
                <div className="col-span-1 flex items-center">Date</div>
                <div className="col-span-1 flex items-center">Shipment</div>
                <div className="col-span-3 flex items-center">Notes</div>
                <div className="col-span-1 flex items-center justify-end text-emerald-600">Money In</div>
                <div className="col-span-1 flex items-center justify-end text-rose-600">Money Out</div>
                <div className="col-span-1 flex items-center justify-end">Balance</div>
                <div className="col-span-1 flex items-center justify-center">Edit</div>
                <div className="col-span-1 flex items-center justify-center">Delete</div>
              </div>

              {/* BODY */}
              <div>
                {selectedEntries.map((entry: any) => (
                  <div key={entry.id} className="border-b border-slate-200 last:border-b-0">
                    <EntryRow entry={entry} onDelete={handleDelete} showDivider={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MOBILE VIEW - Cards */}
          <div className="md:hidden space-y-3">
            {selectedEntries.map((entry: any) => (
              <div key={entry.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
                <EntryRow entry={entry} onDelete={handleDelete} showDivider={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <div>
          <h3 className="text-lg font-semibold mb-4">Add Transaction</h3>
          <AddEntryForm onSuccess={() => setShowAddModal(false)} />
        </div>
      </Modal>
    </div>
  )
}
