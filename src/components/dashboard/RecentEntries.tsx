import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import type { Earning, Expense } from '@/types'
import styles from './RecentEntries.module.scss'

interface Props {
  earnings: Earning[]
  expenses: Expense[]
}

type Row = {
  id: string
  date: Date
  type: string
  label: string
  description: string
  amount: number
  isEarning: boolean
}

const TYPE_LABEL: Record<string, string> = {
  gas:         'Gas',
  mileage:     'Mileage',
  maintenance: 'Maintenance',
  other:       'Other',
}

export default function RecentEntries({ earnings, expenses }: Props) {
  const rows: Row[] = [
    ...earnings.map(e => ({
      id:          e.id,
      date:        new Date(e.dashed_at),
      type:        'earning',
      label:       'Earnings',
      description: e.notes ?? `${e.active_hours.toFixed(1)} hrs dashed`,
      amount:      e.amount,
      isEarning:   true,
    })),
    ...expenses.map(e => ({
      id:          e.id,
      date:        new Date(e.expensed_at),
      type:        e.type,
      label:       TYPE_LABEL[e.type] ?? e.type,
      description: e.description ?? (e.type === 'mileage' ? `${e.miles} mi @ $${e.irs_rate}/mi` : ''),
      amount:      e.amount,
      isEarning:   false,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 10)

  if (!rows.length) {
    return <p className={styles.empty}>No entries yet. Start by logging a dash!</p>
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th className={styles.right}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td className={styles.date}>
                {format(row.date, 'MMM d, h:mm a')}
              </td>
              <td>
                <span className={`${styles.pill} ${styles[row.type]}`}>
                  {row.label}
                </span>
              </td>
              <td className={styles.desc}>{row.description}</td>
              <td className={`${styles.right} ${row.isEarning ? styles.earn : styles.expense}`}>
                {row.isEarning ? '+' : '−'}{formatCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
