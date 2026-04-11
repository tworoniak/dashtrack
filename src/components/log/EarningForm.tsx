import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { earningSchema, type EarningSchema } from '@/lib/schemas'
import { useLogEarning } from '@/hooks/useLogEntry'
import FormField from '@/components/ui/FormField'
import styles from './forms.module.scss'

const todayISO = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")

export default function EarningForm() {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useLogEarning()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EarningSchema>({
    resolver: zodResolver(earningSchema),
    defaultValues: { dashed_at: todayISO() },
  })

  async function onSubmit(values: EarningSchema) {
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
      <div className={styles.row}>
        <FormField label="Earnings ($)" htmlFor="amount" error={errors.amount?.message}>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={`${styles.input} ${errors.amount ? styles.hasError : ''}`}
            {...register('amount')}
          />
        </FormField>

        <FormField label="Active hours" htmlFor="active_hours" error={errors.active_hours?.message}>
          <input
            id="active_hours"
            type="number"
            step="0.1"
            min="0"
            placeholder="2.5"
            className={`${styles.input} ${errors.active_hours ? styles.hasError : ''}`}
            {...register('active_hours')}
          />
        </FormField>
      </div>

      <FormField label="Date & time" htmlFor="dashed_at" error={errors.dashed_at?.message}>
        <input
          id="dashed_at"
          type="datetime-local"
          className={`${styles.input} ${errors.dashed_at ? styles.hasError : ''}`}
          {...register('dashed_at')}
        />
      </FormField>

      <FormField label="Notes (optional)" htmlFor="notes" error={errors.notes?.message}>
        <textarea
          id="notes"
          placeholder="e.g. Lunch rush, downtown area"
          className={styles.textarea}
          {...register('notes')}
        />
      </FormField>

      {submitError && <p className={styles.errorMsg}>{submitError}</p>}
      {success && <p className={styles.successMsg}>Earnings logged!</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? 'Saving…' : 'Log earnings'}
        </button>
      </div>
    </form>
  )
}
