// ─── Supabase DB row types ────────────────────────────────────────────────────

export type EntryType = 'earning' | 'gas' | 'mileage' | 'maintenance' | 'other'

export type Period = 'day' | 'week' | 'month' | 'ytd'

export interface Earning {
  id: string
  user_id: string
  amount: number
  active_hours: number
  notes: string | null
  dashed_at: string    // ISO datetime
  created_at: string
  deleted_at: string | null
}

export interface Expense {
  id: string
  user_id: string
  type: Exclude<EntryType, 'earning'>
  amount: number
  description: string | null
  // gas-specific
  gallons?: number | null
  price_per_gallon?: number | null
  // mileage-specific
  miles?: number | null
  irs_rate?: number | null
  deductible_amount?: number | null
  expensed_at: string  // ISO datetime
  created_at: string
  deleted_at: string | null
}

// ─── Form schemas ─────────────────────────────────────────────────────────────

export interface EarningFormValues {
  amount: number
  active_hours: number
  notes?: string
  dashed_at: string
}

export interface GasFormValues {
  gallons: number
  price_per_gallon: number
  dashed_at: string
}

export interface MileageFormValues {
  miles: number
  dashed_at: string
}

export interface MaintenanceFormValues {
  amount: number
  description: string
  dashed_at: string
}

export interface OtherExpenseFormValues {
  amount: number
  description: string
  dashed_at: string
}

// ─── Dashboard / derived types ────────────────────────────────────────────────

export interface KpiSummary {
  grossEarnings: number
  totalExpenses: number
  netProfit: number
  effectiveHourlyRate: number
  activeHours: number
  totalMiles: number
}

export interface DailyPoint {
  label: string        // e.g. "Mon", "Jan 1"
  earnings: number
  expenses: number
}

export interface ExpenseBreakdown {
  type: Exclude<EntryType, 'earning'>
  label: string
  amount: number
  pct: number
}
