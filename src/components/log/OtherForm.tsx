import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { otherSchema, type OtherSchema } from '@/lib/schemas'
import { useLogOther } from '@/hooks/useLogEntry'
import { useFormSubmit } from '@/hooks/useFormSubmit'
import FormField from '@/components/ui/FormField'
import styles from './forms.module.scss'

const todayISO = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")

export default function OtherForm() {
  const { mutateAsync, isPending } = useLogOther()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OtherSchema>({
    resolver: zodResolver(otherSchema),
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

      <FormField
        label="Description"
        htmlFor="description"
        error={errors.description?.message}
        hint="e.g. Insulated bag, phone mount, car wash"
      >
        <input
          id="description"
          type="text"
          placeholder="Describe the expense"
          className={`${styles.input} ${errors.description ? styles.hasError : ''}`}
          {...register('description')}
        />
      </FormField>

      {submitError && <p className={styles.errorMsg} role="alert">{submitError}</p>}
      {success && <p className={styles.successMsg} role="status">Expense logged!</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending && <span className={styles.spinner} aria-hidden="true" />}
          {isPending ? 'Saving…' : 'Log expense'}
        </button>
      </div>
    </form>
  )
}
