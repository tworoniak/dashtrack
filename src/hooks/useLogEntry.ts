import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { IRS_MILEAGE_RATE_2025 } from '@/lib/utils'
import type { EarningSchema, GasSchema, MileageSchema, MaintenanceSchema, OtherSchema } from '@/lib/schemas'

export function useLogEarning() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: EarningSchema) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('earnings').insert({
        user_id:      user!.id,
        amount:       values.amount,
        active_hours: values.active_hours,
        notes:        values.notes ?? null,
        dashed_at:    values.dashed_at,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['earnings'] }),
  })
}

export function useLogGas() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: GasSchema) => {
      const { data: { user } } = await supabase.auth.getUser()
      const amount = parseFloat((values.gallons * values.price_per_gallon).toFixed(2))
      const { error } = await supabase.from('expenses').insert({
        user_id:          user!.id,
        type:             'gas',
        amount,
        gallons:          values.gallons,
        price_per_gallon: values.price_per_gallon,
        expensed_at:      values.dashed_at,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useLogMileage() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: MileageSchema) => {
      const { data: { user } } = await supabase.auth.getUser()
      const deductible_amount = parseFloat((values.miles * IRS_MILEAGE_RATE_2025).toFixed(2))
      const { error } = await supabase.from('expenses').insert({
        user_id:           user!.id,
        type:              'mileage',
        amount:            deductible_amount,
        miles:             values.miles,
        irs_rate:          IRS_MILEAGE_RATE_2025,
        deductible_amount,
        expensed_at:       values.dashed_at,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useLogMaintenance() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: MaintenanceSchema) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('expenses').insert({
        user_id:     user!.id,
        type:        'maintenance',
        amount:      values.amount,
        description: values.description,
        expensed_at: values.dashed_at,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export function useLogOther() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (values: OtherSchema) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('expenses').insert({
        user_id:     user!.id,
        type:        'other',
        amount:      values.amount,
        description: values.description,
        expensed_at: values.dashed_at,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
