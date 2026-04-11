import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { maintenanceSchema, type MaintenanceSchema } from '@/lib/schemas'
import { useLogMaintenance } from '@/hooks/useLogEntry'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import FormField from '@/components/ui/FormField'
import styles from './forms.module.scss'

const todayISO = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")

export default function MaintenanceForm() {
  const { mutateAsync, isPending } = useLogMaintenance()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceSchema>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: { dashed_at: todayISO() },
  })

  const { onSubmit, submitError, success } = useFormSubmit(mutateAsync, () => reset({ dashed_at: todayISO() }))

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.row}>
        <FormField label="Amount ($)" htmlFor="amount" error={errors.amount?.message}>
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

        <FormField label="Date & time" htmlFor="dashed_at" error={errors.dashed_at?.message}>
          <input
            id="dashed_at"
            type="datetime-local"
            className={`${styles.input} ${errors.dashed_at ? styles.hasError : ''}`}
            {...register('dashed_at')}
          />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" error={errors.description?.message}>
        <input
          id="description"
          type="text"
          placeholder="e.g. Oil change — Valvoline"
          className={`${styles.input} ${errors.description ? styles.hasError : ''}`}
          {...register('description')}
        />
      </FormField>

      {submitError && <p className={styles.errorMsg}>{submitError}</p>}
      {success && <p className={styles.successMsg}>Maintenance expense logged!</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? 'Saving…' : 'Log maintenance'}
        </button>
      </div>
    </form>
  )
}
