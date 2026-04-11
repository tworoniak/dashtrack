import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { IRS_MILEAGE_RATE_2025 } from '@/lib/utils'
import type { EarningSchema, GasSchema, MileageSchema, MaintenanceSchema, OtherSchema } from '@/lib/schemas'

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteEarning() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('earnings').update({ deleted_at: new Date().toISOString() }).eq('id', id).throwOnError()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['earnings'] }),
  })
}

export function useDeleteExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('expenses').update({ deleted_at: new Date().toISOString() }).eq('id', id).throwOnError()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function useEditEarning() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: EarningSchema }) => {
      await supabase.from('earnings').update({
        amount:       values.amount,
        active_hours: values.active_hours,
        notes:        values.notes ?? null,
        dashed_at:    values.dashed_at,
      }).eq('id', id).throwOnError()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['earnings'] }),
  })
}

export function useEditExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, type, values }: {
      id: string
      type: string
      values: GasSchema | MileageSchema | MaintenanceSchema | OtherSchema
    }) => {
      let patch: Record<string, unknown> = { expensed_at: values.dashed_at }

      if (type === 'gas') {
        const v = values as GasSchema
        patch = {
          ...patch,
          amount:           parseFloat((v.gallons * v.price_per_gallon).toFixed(2)),
          gallons:          v.gallons,
          price_per_gallon: v.price_per_gallon,
        }
      } else if (type === 'mileage') {
        const v = values as MileageSchema
        const deductible = parseFloat((v.miles * IRS_MILEAGE_RATE_2025).toFixed(2))
        patch = {
          ...patch,
          amount:            deductible,
          miles:             v.miles,
          irs_rate:          IRS_MILEAGE_RATE_2025,
          deductible_amount: deductible,
        }
      } else {
        const v = values as MaintenanceSchema | OtherSchema
        patch = { ...patch, amount: v.amount, description: v.description }
      }

      await supabase.from('expenses').update(patch).eq('id', id).throwOnError()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
