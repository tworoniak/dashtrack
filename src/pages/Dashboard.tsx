import { useState } from 'react'
import { useDashboard } from '@/hooks/useDashboard'
import KpiCard from '@/components/dashboard/KpiCard'
import EarningsChart from '@/components/dashboard/EarningsChart'
import ExpenseBreakdown from '@/components/dashboard/ExpenseBreakdown'
import RecentEntries from '@/components/dashboard/RecentEntries'
import PeriodTabs from '@/components/ui/PeriodTabs'
import { formatCurrency } from '@/lib/utils'
import type { Period } from '@/types'
import styles from './Dashboard.module.scss'

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>('week')
  const { kpis, expenseBreakdown, dailySeries, earnings, expenses, isLoading, isError } = useDashboard(period)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Your gig earnings at a glance</p>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading...</div>
      ) : isError ? (
        <p className={styles.error}>Failed to load dashboard data. Please refresh the page.</p>
      ) : (
        <>
          <div className={styles.kpiGrid}>
            <KpiCard
              label="Gross earnings"
              value={formatCurrency(kpis.grossEarnings)}
            />
            <KpiCard
              label="Total expenses"
              value={formatCurrency(kpis.totalExpenses)}
              variant="expense"
            />
            <KpiCard
              label="Net profit"
              value={formatCurrency(kpis.netProfit)}
              variant={kpis.netProfit >= 0 ? 'profit' : 'expense'}
            />
            <KpiCard
              label="Effective $/hr"
              value={formatCurrency(kpis.effectiveHourlyRate)}
              sub={`${kpis.activeHours.toFixed(1)} hrs active`}
            />
          </div>

          <div className={styles.chartRow}>
            <div className={styles.chartCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Earnings vs expenses</span>
              </div>
              <EarningsChart data={dailySeries} />
            </div>

            <div className={styles.breakdownCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>Expense breakdown</span>
              </div>
              <ExpenseBreakdown data={expenseBreakdown} />
            </div>
          </div>

          <div className={styles.recentCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTitle}>Recent entries</span>
            </div>
            <RecentEntries earnings={earnings} expenses={expenses} />
          </div>
        </>
      )}
    </div>
  )
}
