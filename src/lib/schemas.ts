import { z } from 'zod'

const dateField = z.string().min(1, 'Date is required')

export const earningSchema = z.object({
  amount:       z.coerce.number().min(0.01, 'Amount must be greater than 0').max(9_999, 'Amount seems too high — max $9,999 per entry'),
  active_hours: z.coerce.number().min(0.1, 'Hours must be greater than 0').max(24, 'Hours cannot exceed 24 per entry'),
  notes:        z.string().max(500, 'Notes must be 500 characters or less').optional(),
  dashed_at:    dateField,
})

export const gasSchema = z.object({
  gallons:          z.coerce.number().min(0.1, 'Enter gallons filled').max(200, 'Gallons seems too high — max 200'),
  price_per_gallon: z.coerce.number().min(0.01, 'Enter price per gallon').max(20, 'Price per gallon seems too high — max $20'),
  dashed_at:        dateField,
})

export const mileageSchema = z.object({
  miles:     z.coerce.number().min(0.1, 'Enter miles driven').max(5_000, 'Miles seems too high — max 5,000 per entry'),
  dashed_at: dateField,
})

export const maintenanceSchema = z.object({
  amount:      z.coerce.number().min(0.01, 'Amount must be greater than 0').max(99_999, 'Amount seems too high — max $99,999'),
  description: z.string().min(1, 'Add a short description').max(500, 'Description must be 500 characters or less'),
  dashed_at:   dateField,
})

export const otherSchema = z.object({
  amount:      z.coerce.number().min(0.01, 'Amount must be greater than 0').max(99_999, 'Amount seems too high — max $99,999'),
  description: z.string().min(1, 'Add a short description').max(500, 'Description must be 500 characters or less'),
  dashed_at:   dateField,
})

export type EarningSchema      = z.infer<typeof earningSchema>
export type GasSchema          = z.infer<typeof gasSchema>
export type MileageSchema      = z.infer<typeof mileageSchema>
export type MaintenanceSchema  = z.infer<typeof maintenanceSchema>
export type OtherSchema        = z.infer<typeof otherSchema>
