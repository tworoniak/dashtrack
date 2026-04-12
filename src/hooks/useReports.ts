import { useQuery } from '@tanstack/react-query'
import { format, startOfYear, endOfYear } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { computeKpis } from '@/lib/utils'
import type { Earning, Expense } from '@/types'

export interface MonthlyReport {
  month: string        // e.g. "Jan 2025"
  monthKey: string     // e.g. "2025-01"
  grossEarnings: number
  totalExpenses: number
  netProfit: number
  activeHours: number
  effectiveHourlyRate: number
  totalMiles: number
  expenseByType: Record<string, number>
}

async function fetchYear(year: number): Promise<{ earnings: Earning[]; expenses: Expense[] }> {
  const yearDate = new Date(year, 0, 1)
  const from = startOfYear(yearDate).toISOString()
  const to   = endOfYear(yearDate).toISOString()

  const [{ data: earnings, error: e1 }, { data: expenses, error: e2 }] = await Promise.all([
    supabase.from('earnings').select('*').gte('dashed_at', from).lte('dashed_at', to).is('deleted_at', null),
    supabase.from('expenses').select('*').gte('expensed_at', from).lte('expensed_at', to).is('deleted_at', null),
  ])

  if (e1) throw e1
  if (e2) throw e2

  return { earnings: earnings ?? [], expenses: expenses ?? [] }
}

function groupByMonth(earnings: Earning[], expenses: Expense[]): MonthlyReport[] {
  const monthMap: Record<string, { earnings: Earning[]; expenses: Expense[] }> = {}

  for (const e of earnings) {
    const key = format(new Date(e.dashed_at), 'yyyy-MM')
    if (!monthMap[key]) monthMap[key] = { earnings: [], expenses: [] }
    monthMap[key].earnings.push(e)
  }

  for (const e of expenses) {
    const key = format(new Date(e.expensed_at), 'yyyy-MM')
    if (!monthMap[key]) monthMap[key] = { earnings: [], expenses: [] }
    monthMap[key].expenses.push(e)
  }

  return Object.entries(monthMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, { earnings, expenses }]) => {
      const kpis = computeKpis(earnings, expenses)

      const expenseByType: Record<string, number> = {}
      for (const e of expenses) {
        expenseByType[e.type] = (expenseByType[e.type] ?? 0) + e.amount
      }

      return {
        month:    format(new Date(`${key}-01`), 'MMM yyyy'),
        monthKey: key,
        grossEarnings:      kpis.grossEarnings,
        totalExpenses:      kpis.totalExpenses,
        netProfit:          kpis.netProfit,
        activeHours:        kpis.activeHours,
        effectiveHourlyRate: kpis.effectiveHourlyRate,
        totalMiles:         kpis.totalMiles,
        expenseByType,
      }
    })
}

export const FIRST_YEAR = 2023
export function getCurrentYear() { return new Date().getFullYear() }

export function useReports(year: number = getCurrentYear()) {
  return useQuery({
    queryKey: ['reports', year],
    queryFn: async () => {
      const { earnings, expenses } = await fetchYear(year)
      return {
        months: groupByMonth(earnings, expenses),
        allEarnings: earnings,
        allExpenses: expenses,
      }
    },
  })
}

// ─── CSV export ───────────────────────────────────────────────────────────────

export function exportEarningsCSV(earnings: Earning[]) {
  const rows = [
    ['Date', 'Amount', 'Active Hours', 'Notes'],
    ...earnings.map(e => [
      format(new Date(e.dashed_at), 'yyyy-MM-dd HH:mm'),
      e.amount.toFixed(2),
      e.active_hours.toFixed(2),
      e.notes ?? '',
    ]),
  ]
  downloadCSV(rows, 'dashtrack-earnings.csv')
}

export function exportExpensesCSV(expenses: Expense[]) {
  const rows = [
    ['Date', 'Type', 'Amount', 'Description', 'Gallons', 'Price/Gal', 'Miles', 'IRS Rate', 'Deductible'],
    ...expenses.map(e => [
      format(new Date(e.expensed_at), 'yyyy-MM-dd HH:mm'),
      e.type,
      e.amount.toFixed(2),
      e.description ?? '',
      e.gallons?.toFixed(3) ?? '',
      e.price_per_gallon?.toFixed(3) ?? '',
      e.miles?.toFixed(1) ?? '',
      e.irs_rate?.toFixed(3) ?? '',
      e.deductible_amount?.toFixed(2) ?? '',
    ]),
  ]
  downloadCSV(rows, 'dashtrack-expenses.csv')
}

function downloadCSV(rows: (string | number)[][], filename: string) {
  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  try {
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
  } finally {
    URL.revokeObjectURL(url)
  }
}
