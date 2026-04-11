import { useState } from 'react'

export function useFormSubmit<T>(
  mutateAsync: (values: T) => Promise<void>,
  onSuccess: () => void,
) {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  async function onSubmit(values: T) {
    setSubmitError(null)
    try {
      await mutateAsync(values)
      onSuccess()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  return { onSubmit, submitError, success }
}
