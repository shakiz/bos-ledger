// Get carry-forward balance for a given month
export function getCarryForwardBalance(entries: LedgerEntry[], month: string) {
  // month: 'YYYY-MM'
  const target = dayjs(month + '-01')
  // Filter entries before the start of this month
  const prevEntries = entries.filter(e => dayjs(e.date).isBefore(target, 'month'))
  const summary = calculateMonthlySummary(prevEntries)
  return summary.finalBalance
}
import { LedgerEntry } from '@prisma/client'
import dayjs from 'dayjs'

export type Entry = Pick<LedgerEntry, 'id' | 'date' | 'type' | 'amount' | 'category' | 'description' | 'createdAt'> & { amountNumber: number }

// Convert Prisma Decimal/string to number safely
export function toNumber(value: any) {
  if (value == null) return 0
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseFloat(value)
  if (typeof value.toNumber === 'function') return value.toNumber()
  return Number(value)
}

// Group entries by date (YYYY-MM-DD)
export function groupByDate(entries: LedgerEntry[]) {
  const map: Record<string, LedgerEntry[]> = {}
  for (const e of entries) {
    const d = dayjs(e.date).format('YYYY-MM-DD')
    map[d] = map[d] ?? []
    map[d].push(e)
  }
  return map
}

export function calculateDailyTotals(entries: LedgerEntry[]) {
  // returns a map date -> { totalIn, totalOut, balance }
  const grouped = groupByDate(entries)
  const result: Record<string, { totalIn: number; totalOut: number; balance: number }> = {}
  for (const [date, list] of Object.entries(grouped)) {
    let inSum = 0
    let outSum = 0
    for (const e of list) {
      const amt = toNumber(e.amount)
      if (e.type === 'IN') inSum += amt
      else outSum += amt
    }
    result[date] = { totalIn: inSum, totalOut: outSum, balance: inSum - outSum }
  }
  return result
}

export function calculateMonthlySummary(entries: LedgerEntry[]) {
  // Sort entries by date ascending
  const byDate = entries.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  let running = 0
  let totalIn = 0
  let totalOut = 0
  const daily: { date: string; totalIn: number; totalOut: number; balance: number; runningBalance: number }[] = []

  const grouped = groupByDate(byDate)
  const dates = Object.keys(grouped).sort()
  for (const date of dates) {
    const list = grouped[date]
    let inSum = 0
    let outSum = 0
    for (const e of list) {
      const amt = toNumber(e.amount)
      if (e.type === 'IN') inSum += amt
      else outSum += amt
    }
    totalIn += inSum
    totalOut += outSum
    running += inSum - outSum
    daily.push({ date, totalIn: inSum, totalOut: outSum, balance: inSum - outSum, runningBalance: running })
  }

  return { totalIn, totalOut, finalBalance: running, daily }
}
