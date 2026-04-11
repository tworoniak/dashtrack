import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns'
import type { Period, DailyPoint, Earning, Expense, KpiSummary, ExpenseBreakdown } from '@/types'

// ─── IRS mileage rate ─────────────────────────────────────────────────────────
export const IRS_MILEAGE_RATE_2025 = 0.70  // $0.70/mile for 2025

// ─── Date range helpers ───────────────────────────────────────────────────────

export function getPeriodRange(period: Period): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString()

  const fromMap: Record<Period, Date> = {
    day:   startOfDay(now),
    week:  startOfWeek(now, { weekStartsOn: 1 }),
    month: startOfMonth(now),
    ytd:   startOfYear(now),
  }

  return { from: fromMap[period].toISOString(), to }
}

// ─── KPI computation ──────────────────────────────────────────────────────────

export function computeKpis(
  earnings: Earning[],
  expenses: Expense[]
): KpiSummary {
  const grossEarnings = earnings.reduce((s, e) => s + e.amount, 0)
  const activeHours   = earnings.reduce((s, e) => s + e.active_hours, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const netProfit     = grossEarnings - totalExpenses
  const effectiveHourlyRate = activeHours > 0 ? netProfit / activeHours : 0
  const totalMiles    = expenses
    .filter(e => e.type === 'mileage')
    .reduce((s, e) => s + (e.miles ?? 0), 0)

  return { grossEarnings, totalExpenses, netProfit, effectiveHourlyRate, activeHours, totalMiles }
}

// ─── Expense breakdown ────────────────────────────────────────────────────────

const EXPENSE_LABELS: Record<string, string> = {
  gas:         'Gas',
  mileage:     'Mileage deduction',
  maintenance: 'Maintenance',
  other:       'Other',
}

export function computeExpenseBreakdown(expenses: Expense[]): ExpenseBreakdown[] {
  const totals: Record<string, number> = {}

  for (const e of expenses) {
    totals[e.type] = (totals[e.type] ?? 0) + e.amount
  }

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0) || 1

  return Object.entries(totals)
    .sort(([, a], [, b]) => b - a)
    .map(([type, amount]) => ({
      type: type as ExpenseBreakdown['type'],
      label: EXPENSE_LABELS[type] ?? type,
      amount,
      pct: Math.round((amount / grandTotal) * 100),
    }))
}

// ─── Daily chart series ───────────────────────────────────────────────────────

export function buildDailySeries(
  earnings: Earning[],
  expenses: Expense[],
  period: Period
): DailyPoint[] {
  const fmt = period === 'ytd' || period === 'month' ? 'MMM d' : 'EEE'

  const earningsByDay: Record<string, number> = {}
  const expensesByDay: Record<string, number> = {}

  for (const e of earnings) {
    const key = format(new Date(e.dashed_at), fmt)
    earningsByDay[key] = (earningsByDay[key] ?? 0) + e.amount
  }

  for (const e of expenses) {
    const key = format(new Date(e.expensed_at), fmt)
    expensesByDay[key] = (expensesByDay[key] ?? 0) + e.amount
  }

  const allKeys = Array.from(new Set([...Object.keys(earningsByDay), ...Object.keys(expensesByDay)]))

  return allKeys.map(label => ({
    label,
    earnings: earningsByDay[label] ?? 0,
    expenses: expensesByDay[label] ?? 0,
  }))
}

// ─── Rounding helper ─────────────────────────────────────────────────────────

/** Round to 2 decimal places using Math.round to avoid float drift */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Currency formatter ───────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
