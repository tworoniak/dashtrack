import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { gasSchema, type GasSchema } from '@/lib/schemas'
import { useLogGas } from '@/hooks/useLogEntry'
import FormField from '@/components/ui/FormField'
import styles from './forms.module.scss'

const todayISO = () => format(new Date(), "yyyy-MM-dd'T'HH:mm")

export default function GasForm() {
  const [success, setSuccess] = useState(false)
  const { mutateAsync, isPending } = useLogGas()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<GasSchema>({
    resolver: zodResolver(gasSchema),
    defaultValues: { dashed_at: todayISO() },
  })

  const gallons = useWatch({ control, name: 'gallons' })
  const pricePerGallon = useWatch({ control, name: 'price_per_gallon' })
  const total = gallons && pricePerGallon ? (gallons * pricePerGallon).toFixed(2) : null

  async function onSubmit(values: GasSchema) {
    await mutateAsync(values)
    reset({ dashed_at: todayISO() })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.row}>
        <FormField label="Gallons" htmlFor="gallons" error={errors.gallons?.message}>
          <input
            id="gallons"
            type="number"
            step="0.01"
            min="0"
            placeholder="10.5"
            className={`${styles.input} ${errors.gallons ? styles.hasError : ''}`}
            {...register('gallons')}
          />
        </FormField>

        <FormField label="Price per gallon ($)" htmlFor="price_per_gallon" error={errors.price_per_gallon?.message}>
          <input
            id="price_per_gallon"
            type="number"
            step="0.001"
            min="0"
            placeholder="3.19"
            className={`${styles.input} ${errors.price_per_gallon ? styles.hasError : ''}`}
            {...register('price_per_gallon')}
          />
        </FormField>
      </div>

      {total && (
        <p className={styles.calcPreview}>
          Total fill-up cost: <strong>${total}</strong>
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

      {success && <p className={styles.successMsg}>Gas fill-up logged!</p>}

      <div className={styles.actions}>
        <button type="submit" className={styles.submitBtn} disabled={isPending}>
          {isPending ? 'Saving…' : 'Log gas'}
        </button>
      </div>
    </form>
  )
}
