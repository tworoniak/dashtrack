import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { mileageSchema, type MileageSchema } from '@/lib/schemas'
import { useLogMileage } from '@/hooks/useLogEntry'
import { IRS_MILEAGE_RATE_2025 } from '@/lib/utils'
import FormField from '@/components/ui/FormField'
import styles from './forms.module.scss'

const todayISO = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")

export default function MileageForm() {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useLogMileage()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<MileageSchema>({
    resolver: zodResolver(mileageSchema),
    defaultValues: { dashed_at: todayISO() },
  })

  const miles = useWatch({ control, name: 'miles' })
  const deduction = miles ? (miles * IRS_MILEAGE_RATE_2025).toFixed(2) : null

  async function onSubmit(values: MileageSchema) {
    setSubmitError(null)
    try {
      await mutateAsync(values)
      reset({ dashed_at: todayISO() })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Miles driven"
        htmlFor="miles"
        error={errors.miles?.message}
        hint="Business miles only — not personal trips"
      >
        <input
          id="miles"
          type="number"
          step="0.1"
          min="0"
          placeholder="38"
          className={`${styles.input} ${errors.miles ? styles.hasError : ''}`}
          {...register('miles')}
        />
      </FormField>

      {deduction && (
        <p className={styles.calcPreview}>
          IRS deduction ({IRS_MILEAGE_RATE_2025}¢/mi): <strong>${deduction}</strong>
        </p>
      )}

      <FormField label="Date & time" htmlFor="dashed_at" error={errors.dashed_at?.message}>
        <input
          id="dashed_at"
          type="datetime-local"
          className={`${styles.input} ${errors.dashed_at ? styles.hasError : ''}`}
          {...register('dashed_at')}
        />
      </FormField>

      {submitError && <p className={styles.errorMsg}>{submitError}</p>}
      {success && <p className={styles.successMsg}>Mileage logged!</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? 'Saving…' : 'Log mileage'}
        </button>
      </div>
    </form>
  )
}
