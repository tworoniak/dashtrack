import styles from './KpiCard.module.scss'

interface Props {
  label: string
  value: string
  sub?: string
  variant?: 'default' | 'expense' | 'profit'
}

export default function KpiCard({ label, value, sub, variant = 'default' }: Props) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={`${styles.value} ${styles[variant]}`}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  )
}
