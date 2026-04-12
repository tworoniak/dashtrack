import type { Period } from '@/types'
import styles from './PeriodTabs.module.scss'

const TABS: { value: Period; label: string }[] = [
  { value: 'day',   label: 'Day' },
  { value: 'week',  label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'ytd',   label: 'YTD' },
]

interface Props {
  value: Period
  onChange: (p: Period) => void
}

export default function PeriodTabs({ value, onChange }: Props) {
  return (
    <div className={styles.tabs} role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          className={`${styles.tab} ${value === tab.value ? styles.active : ''}`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
