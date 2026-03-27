import { useReports, exportEarningsCSV, exportExpensesCSV } from '@/hooks/useReports'
import { formatCurrency } from '@/lib/utils'
import styles from './Reports.module.scss'

export default function Reports() {
  const { data, isLoading } = useReports()

  const ytdEarnings = data?.months.reduce((s, m) => s + m.grossEarnings, 0) ?? 0
  const ytdExpenses = data?.months.reduce((s, m) => s + m.totalExpenses, 0) ?? 0
  const ytdProfit   = ytdEarnings - ytdExpenses
  const ytdMiles    = data?.months.reduce((s, m) => s + m.totalMiles, 0) ?? 0

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reports</h1>
          <p className={styles.subtitle}>Year-to-date summary and monthly breakdown</p>
        </div>
        <div className={styles.exportBtns}>
          <button
            className={styles.exportBtn}
            onClick={() => data && exportEarningsCSV(data.allEarnings)}
            disabled={!data}
          >
            Export earnings CSV
          </button>
          <button
            className={styles.exportBtn}
            onClick={() => data && exportExpensesCSV(data.allExpenses)}
            disabled={!data}
          >
            Export expenses CSV
          </button>
        </div>
      </div>

      <div className={styles.ytdStrip}>
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>YTD gross earnings</span>
          <span className={styles.ytdValue}>{formatCurrency(ytdEarnings)}</span>
        </div>
        <div className={styles.ytdDivider} />
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>YTD total expenses</span>
          <span className={styles.ytdValue}>{formatCurrency(ytdExpenses)}</span>
        </div>
        <div className={styles.ytdDivider} />
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>YTD net profit</span>
          <span className={`${styles.ytdValue} ${ytdProfit >= 0 ? styles.profit : styles.loss}`}>
            {formatCurrency(ytdProfit)}
          </span>
        </div>
        <div className={styles.ytdDivider} />
        <div className={styles.ytdItem}>
          <span className={styles.ytdLabel}>YTD miles logged</span>
          <span className={styles.ytdValue}>{ytdMiles.toLocaleString()} mi</span>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading reports…</p>
      ) : !data?.months.length ? (
        <p className={styles.empty}>No data yet. Start logging entries to see your monthly breakdown.</p>
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
