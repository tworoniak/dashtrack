import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getPeriodRange, computeKpis, computeExpenseBreakdown, buildDailySeries } from '@/lib/utils'
import type { Period, Earning, Expense } from '@/types'

async function fetchEarnings(from: string, to: string): Promise<Earning[]> {
  const { data, error } = await supabase
    .from('earnings')
    .select('*')
    .gte('dashed_at', from)
    .lte('dashed_at', to)
    .order('dashed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

async function fetchExpenses(from: string, to: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .gte('expensed_at', from)
    .lte('expensed_at', to)
    .order('expensed_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export function useDashboard(period: Period) {
  const { from, to } = getPeriodRange(period)

  const earningsQuery = useQuery({
    queryKey: ['earnings', period],
    queryFn: () => fetchEarnings(from, to),
  })

  const expensesQuery = useQuery({
    queryKey: ['expenses', period],
    queryFn: () => fetchExpenses(from, to),
  })

  const earnings = earningsQuery.data ?? []
  const expenses = expensesQuery.data ?? []

  const kpis             = computeKpis(earnings, expenses)
  const expenseBreakdown = computeExpenseBreakdown(expenses)
  const dailySeries      = buildDailySeries(earnings, expenses, period)

  return {
    kpis,
    expenseBreakdown,
    dailySeries,
    earnings,
    expenses,
    isLoading: earningsQuery.isLoading || expensesQuery.isLoading,
    isError:   earningsQuery.isError   || expensesQuery.isError,
  }
}
