import { describe, it, expect } from 'vitest'
import { formatCurrency, round2, computeKpis, computeExpenseBreakdown } from './utils'
import type { Earning, Expense } from '@/types'

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formats positive dollar amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats negative values', () => {
    expect(formatCurrency(-42.5)).toBe('-$42.50')
  })

  it('adds trailing zeros for whole numbers', () => {
    expect(formatCurrency(100)).toBe('$100.00')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(9.999)).toBe('$10.00')
  })
})

// ─── round2 ───────────────────────────────────────────────────────────────────

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(1.555)).toBe(1.56)
  })

  it('leaves already-rounded values unchanged', () => {
    expect(round2(3.14)).toBe(3.14)
  })

  it('handles zero', () => {
    expect(round2(0)).toBe(0)
  })

  it('handles large numbers', () => {
    expect(round2(9999.999)).toBe(10000)
  })

  it('avoids float drift on SE tax calculation', () => {
    // 92.35% of 10,000 then 15.3% — should not produce trailing noise
    const base = round2(10_000 * 0.9235)
    const tax  = round2(base * 0.153)
    expect(tax).toBe(1412.96)
  })
})

// ─── computeKpis ─────────────────────────────────────────────────────────────

const makeEarning = (amount: number, active_hours: number): Earning => ({
  id: crypto.randomUUID(),
  user_id: 'u1',
  amount,
  active_hours,
  notes: null,
  dashed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  deleted_at: null,
})

const makeExpense = (type: Expense['type'], amount: number, miles?: number): Expense => ({
  id: crypto.randomUUID(),
  user_id: 'u1',
  type,
  amount,
  expensed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  description: null,
  gallons: null,
  price_per_gallon: null,
  miles: miles ?? null,
  irs_rate: null,
  deductible_amount: null,
  deleted_at: null,
})

describe('computeKpis', () => {
  it('returns zeroes for empty arrays', () => {
    const kpis = computeKpis([], [])
    expect(kpis.grossEarnings).toBe(0)
    expect(kpis.totalExpenses).toBe(0)
    expect(kpis.netProfit).toBe(0)
    expect(kpis.effectiveHourlyRate).toBe(0)
    expect(kpis.activeHours).toBe(0)
    expect(kpis.totalMiles).toBe(0)
  })

  it('sums earnings correctly', () => {
    const kpis = computeKpis([makeEarning(100, 2), makeEarning(50, 1)], [])
    expect(kpis.grossEarnings).toBe(150)
    expect(kpis.activeHours).toBe(3)
  })

  it('sums expenses correctly', () => {
    const kpis = computeKpis([], [makeExpense('gas', 40), makeExpense('maintenance', 60)])
    expect(kpis.totalExpenses).toBe(100)
  })

  it('computes net profit', () => {
    const kpis = computeKpis([makeEarning(200, 4)], [makeExpense('gas', 30)])
    expect(kpis.netProfit).toBe(170)
  })

  it('computes effective hourly rate', () => {
    const kpis = computeKpis([makeEarning(120, 4)], [makeExpense('gas', 20)])
    expect(kpis.effectiveHourlyRate).toBe(25) // (120 - 20) / 4
  })

  it('returns 0 for hourly rate when no hours logged', () => {
    const kpis = computeKpis([], [makeExpense('gas', 10)])
    expect(kpis.effectiveHourlyRate).toBe(0)
  })

  it('sums mileage from mileage-type expenses only', () => {
    const kpis = computeKpis([], [
      makeExpense('mileage', 28, 40),
      makeExpense('gas', 30),
    ])
    expect(kpis.totalMiles).toBe(40)
  })
})

// ─── computeExpenseBreakdown ──────────────────────────────────────────────────

describe('computeExpenseBreakdown', () => {
  it('returns empty array for no expenses', () => {
    expect(computeExpenseBreakdown([])).toEqual([])
  })

  it('groups expenses by type and computes totals', () => {
    const expenses = [
      makeExpense('gas', 40),
      makeExpense('gas', 20),
      makeExpense('maintenance', 100),
    ]
    const result = computeExpenseBreakdown(expenses)
    const gas  = result.find(r => r.type === 'gas')
    const maint = result.find(r => r.type === 'maintenance')
    expect(gas?.amount).toBe(60)
    expect(maint?.amount).toBe(100)
  })

  it('sorts by amount descending', () => {
    const expenses = [
      makeExpense('gas', 10),
      makeExpense('maintenance', 50),
      makeExpense('other', 30),
    ]
    const result = computeExpenseBreakdown(expenses)
    expect(result[0].type).toBe('maintenance')
    expect(result[1].type).toBe('other')
    expect(result[2].type).toBe('gas')
  })

  it('computes percentage of grand total', () => {
    const expenses = [makeExpense('gas', 75), makeExpense('other', 25)]
    const result = computeExpenseBreakdown(expenses)
    const gas = result.find(r => r.type === 'gas')!
    expect(gas.pct).toBe(75)
  })
})
