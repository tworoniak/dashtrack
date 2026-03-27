import { formatCurrency } from '@/lib/utils'
import type { ExpenseBreakdown as BreakdownItem } from '@/types'
import styles from './ExpenseBreakdown.module.scss'

const COLOR_MAP: Record<string, string> = {
  gas:         '#EF9F27',
  mileage:     '#378ADD',
  maintenance: '#7F77DD',
  other:       '#888780',
}

const BG_MAP: Record<string, string> = {
  gas:         '#FAEEDA',
  mileage:     '#E6F1FB',
  maintenance: '#EEEDFE',
  other:       '#F1EFE8',
}

const EMOJI_MAP: Record<string, string> = {
  gas:         '⛽',
  mileage:     '🛣️',
  maintenance: '🔧',
  other:       '📋',
}

interface Props {
  data: BreakdownItem[]
}

export default function ExpenseBreakdown({ data }: Props) {
  if (!data.length) {
    return <p className={styles.empty}>No expenses logged for this period.</p>
  }

  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <div className={styles.list}>
      {data.map(item => (
        <div key={item.type} className={styles.row}>
          <div
            className={styles.icon}
            style={{ background: BG_MAP[item.type] ?? '#F1EFE8' }}
          >
            {EMOJI_MAP[item.type] ?? '📋'}
          </div>
          <span className={styles.label}>{item.label}</span>
          <div className={styles.barWrap}>
            <div
              className={styles.bar}
              style={{
                width: `${item.pct}%`,
                background: COLOR_MAP[item.type] ?? '#888780',
              }}
            />
          </div>
          <span className={styles.amount}>{formatCurrency(item.amount)}</span>
        </div>
      ))}

      <div className={styles.netRow}>
        <span className={styles.netLabel}>Total expenses</span>
        <span className={styles.netValue}>{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
