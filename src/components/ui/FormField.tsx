import type { ReactNode } from 'react'
import styles from './FormField.module.scss'

interface Props {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

export default function FormField({ label, htmlFor, error, hint, children }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
