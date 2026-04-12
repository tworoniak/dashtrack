import { useState, useEffect, useRef } from 'react'

export function useFormSubmit<T>(
  mutateAsync: (values: T) => Promise<void>,
  onSuccess: () => void,
) {
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  async function onSubmit(values: T) {
    setSubmitError(null)
    try {
      await mutateAsync(values)
      onSuccess()
      setSuccess(true)
      timerRef.current = setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    }
  }

  return { onSubmit, submitError, success }
}
