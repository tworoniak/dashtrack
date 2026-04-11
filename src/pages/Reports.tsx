import { useState } from 'react'
import { useReports, exportEarningsCSV, exportExpensesCSV, FIRST_YEAR, CURRENT_YEAR } from '@/hooks/useReports'
import Skeleton from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import styles from './Reports.module.scss'

const YEARS = Array.from({ length: CURRENT_YEAR - FIRST_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)

export default function Reports() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [exportError, setExportError] = useState<string | null>(null)
  const { data, isLoading, isError } = useReports(year)

  const ytdEarnings = data?.months.reduce((s, m) => s + m.grossEarnings, 0) ?? 0
  const ytdExpenses = data?.months.reduce((s, m) => s + m.totalExpenses, 0) ?? 0
  const ytdProfit   = ytdEarnings - ytdExpenses
  const ytdMiles    = data?.months.reduce((s, m) => s + m.totalMiles, 0) ?? 0

  function handleExport(fn: () => void) {
    setExportError(null)
    try {
      fn()
    } catch {
      setExportError('Export failed. Please try again.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>Year-to-date summary and monthly breakdown</p>
        </div>
        <div className={styles.headerRight}>
          <select
            className={styles.yearSelect}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            aria-label="Select year"
          >
            {YEARS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className={styles.exportBtns}>
            <button
              className={styles.exportBtn}
              onClick={() => data && handleExport(() => exportEarningsCSV(data.allEarnings))}
              disabled={!data}
            >
              Export earnings CSV
            </button>
            <button
              className={styles.exportBtn}
              onClick={() => data && handleExport(() => exportExpensesCSV(data.allExpenses))}
              disabled={!data}
            >
              Export expenses CSV
            </button>
          </div>
        </div>
      </div>

      {exportError && <p className={styles.error}>{exportError}</p>}

      <div className={styles.ytdStrip}>
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>Gross earnings</span>
          <span className={styles.ytdValue}>{formatCurrency(ytdEarnings)}</span>
        </div>
        <div className={styles.ytdDivider} />
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>Total expenses</span>
          <span className={styles.ytdValue}>{formatCurrency(ytdExpenses)}</span>
        </div>
        <div className={styles.ytdDivider} />
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>Net profit</span>
          <span className={`${styles.ytdValue} ${ytdProfit >= 0 ? styles.profit : styles.loss}`}>
            {formatCurrency(ytdProfit)}
          </span>
        </div>
        <div className={styles.ytdDivider} />
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>Miles logged</span>
          <span className={styles.ytdValue}>{ytdMiles.toLocaleString()} mi</span>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={44} borderRadius={0} style={{ borderBottom: '1px solid #f5f5f5' }} />
            ))}
          </div>
        </div>
      ) : isError ? (
        <p className={styles.error}>Failed to load reports. Please refresh the page.</p>
      ) : !data?.months.length ? (
        <p className={styles.empty}>No data yet for {year}. Start logging entries to see your monthly breakdown.</p>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Month</th>
                  <th className={styles.right}>Gross earnings</th>
                  <th className={styles.right}>Gas</th>
                  <th className={styles.right}>Mileage ded.</th>
                  <th className={styles.right}>Maintenance</th>
                  <th className={styles.right}>Other</th>
                  <th className={styles.right}>Total expenses</th>
                  <th className={styles.right}>Net profit</th>
                  <th className={styles.right}>Eff. $/hr</th>
                  <th className={styles.right}>Miles</th>
                </tr>
              </thead>
              <tbody>
                {data.months.map(m => (
                  <tr key={m.monthKey}>
                    <td className={styles.monthCell}>{m.month}</td>
                    <td className={`${styles.right} ${styles.earn}`}>{formatCurrency(m.grossEarnings)}</td>
                    <td className={styles.right}>{formatCurrency(m.expenseByType['gas'] ?? 0)}</td>
                    <td className={styles.right}>{formatCurrency(m.expenseByType['mileage'] ?? 0)}</td>
                    <td className={styles.right}>{formatCurrency(m.expenseByType['maintenance'] ?? 0)}</td>
                    <td className={styles.right}>{formatCurrency(m.expenseByType['other'] ?? 0)}</td>
                    <td className={`${styles.right} ${styles.expense}`}>{formatCurrency(m.totalExpenses)}</td>
                    <td className={`${styles.right} ${m.netProfit >= 0 ? styles.profit : styles.loss}`}>
                      {formatCurrency(m.netProfit)}
                    </td>
                    <td className={styles.right}>{formatCurrency(m.effectiveHourlyRate)}</td>
                    <td className={styles.right}>{m.totalMiles.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className={styles.totalsRow}>
                  <td>Total</td>
                  <td className={`${styles.right} ${styles.earn}`}>{formatCurrency(ytdEarnings)}</td>
                  <td className={styles.right}>
                    {formatCurrency(data.months.reduce((s, m) => s + (m.expenseByType['gas'] ?? 0), 0))}
                  </td>
                  <td className={styles.right}>
                    {formatCurrency(data.months.reduce((s, m) => s + (m.expenseByType['mileage'] ?? 0), 0))}
                  </td>
                  <td className={styles.right}>
                    {formatCurrency(data.months.reduce((s, m) => s + (m.expenseByType['maintenance'] ?? 0), 0))}
                  </td>
                  <td className={styles.right}>
                    {formatCurrency(data.months.reduce((s, m) => s + (m.expenseByType['other'] ?? 0), 0))}
                  </td>
                  <td className={`${styles.right} ${styles.expense}`}>{formatCurrency(ytdExpenses)}</td>
                  <td className={`${styles.right} ${ytdProfit >= 0 ? styles.profit : styles.loss}`}>
                    {formatCurrency(ytdProfit)}
                  </td>
                  <td className={styles.right}>—</td>
                  <td className={styles.right}>{ytdMiles.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
