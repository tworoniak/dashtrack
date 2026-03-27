import { z } from 'zod'

const dateField = z.string().min(1, 'Date is required')

export const earningSchema = z.object({
  amount:       z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  active_hours: z.coerce.number().min(0.1, 'Hours must be greater than 0'),
  notes:        z.string().optional(),
  dashed_at:    dateField,
})

export const gasSchema = z.object({
  gallons:          z.coerce.number().min(0.1, 'Enter gallons filled'),
  price_per_gallon: z.coerce.number().min(0.01, 'Enter price per gallon'),
  dashed_at:        dateField,
})

export const mileageSchema = z.object({
  miles:     z.coerce.number().min(0.1, 'Enter miles driven'),
  dashed_at: dateField,
})

export const maintenanceSchema = z.object({
  amount:      z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Add a short description'),
  dashed_at:   dateField,
})

export const otherSchema = z.object({
  amount:      z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Add a short description'),
  dashed_at:   dateField,
})

export type EarningSchema      = z.infer<typeof earningSchema>
export type GasSchema          = z.infer<typeof gasSchema>
export type MileageSchema      = z.infer<typeof mileageSchema>
export type MaintenanceSchema  = z.infer<typeof maintenanceSchema>
export type OtherSchema        = z.infer<typeof otherSchema>
