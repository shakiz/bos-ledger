"use client"

import React from "react"
import { useForm } from "react-hook-form"
import CreateShipmentModal from "./CreateShipmentModal"
import CreateCategoryModal from "./CreateCategoryModal"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { MdAddCircle } from "react-icons/md"

// Zod schema
const schema = z.object({
  date: z.string(),
  type: z.enum(["IN", "OUT"]),
  amount: z.number().min(0),
  category: z.string().optional(),
  description: z.string().optional(),
  shipmentId: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AddEntryForm({ defaultDate }: { defaultDate?: string }) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate ?? new Date().toISOString().slice(0, 10),
      type: "IN",
      amount: 0,
      category: "",
      description: "",
      shipmentId: "",
    },
  })

  React.useEffect(() => {
    if (defaultDate) setValue("date", defaultDate)
  }, [defaultDate, setValue])

  const [shipments, setShipments] = React.useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = React.useState<string[]>([])
  const [openShipmentModal, setOpenShipmentModal] = React.useState(false)
  const [openCategoryModal, setOpenCategoryModal] = React.useState(false)

  // Load categories
  React.useEffect(() => {
    let active = true
    fetch(`/api/ledger?month=${new Date().toISOString().slice(0, 7)}`)
        .then(r => r.json()).then(data => {
          if (!active) return
          const entries = (data?.entries ?? []) as any[]
          const cats = Array.from(new Set(entries.map((e: any) => (e.category ?? '').toString()).filter(Boolean))) as string[]
          setCategories(cats)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  // Load shipments
  React.useEffect(() => {
    let active = true
    fetch("/api/shipments")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return
        setShipments(data.shipments ?? [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  async function onSubmit(data: FormData) {
    try {
      await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      // reset the form back to defaults
      reset({
        date: defaultDate ?? new Date().toISOString().slice(0, 10),
        type: "IN",
        amount: 0,
        category: "",
        description: "",
        shipmentId: "",
      })
      router.refresh()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <div className="bg-white rounded-xl p-4 border border-[#E8EEF2]">

        {/* responsive controls: stack on small screens, 2-per-row on md, 3-per-row on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[#1D546C] mb-1">Date</label>
            <input
              type="date"
              {...register("date")}
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#0C2B4E]"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-[#1D546C] mb-1">Amount</label>
            <div className="flex items-center rounded-lg border border-[#E0E0E0] bg-white px-3 py-2">
              <span className="text-[#1D546C] mr-2">৳</span>
              <input
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                className="w-full outline-none text-lg text-[#0C2B4E]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-[#1D546C] mb-1">Type</label>
            <select
              {...register("type")}
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#0C2B4E]"
            >
              <option value="IN">Money In (+)</option>
              <option value="OUT">Money Out (-)</option>
            </select>
          </div>

          {/* Shipment Ref */}
          <div>
            <label className="block text-xs font-medium text-[#1D546C] mb-1">Shipment Ref</label>

            <div className="flex items-center gap-2">
              <select
                {...register("shipmentId")}
                className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#0C2B4E]"
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
                className="p-2 text-[#1A3D64] hover:bg-[#F4F4F4] rounded-lg"
                aria-label="Add shipment"
              >
                <MdAddCircle size={22} />
              </button>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[#1D546C] mb-1">Category</label>
            <div className="flex items-center gap-2">
              <select
                {...register("category")}
                className="flex-1 border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#0C2B4E]"
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
            <label className="block text-xs font-medium text-[#1D546C] mb-1">Description</label>
            <input
              {...register("description")}
              className="w-full border border-[#E0E0E0] rounded-lg px-3 py-2 bg-white text-[#0C2B4E]"
              placeholder="e.g. Factory Payment"
            />
          </div>

        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 rounded-lg bg-[#1A3D64] text-white text-lg font-medium hover:bg-[#1D546C] transition"
        >
          Add Entry
        </button>

      </div>

      {/* Modals */}
      <CreateShipmentModal
        open={openShipmentModal}
        onClose={() => setOpenShipmentModal(false)}
        onCreated={(s: any) => {
          setShipments((prev) => [s, ...prev])
          setValue("shipmentId", s.id)
        }}
      />

      <CreateCategoryModal
        open={openCategoryModal}
        onClose={() => setOpenCategoryModal(false)}
        onCreated={(name: string) => {
          setCategories((prev) => [name, ...prev])
          setValue("category", name)
        }}
      />

    </form>
  )
}
