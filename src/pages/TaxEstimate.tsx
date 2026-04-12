import { useState } from 'react'
import { useReports, FIRST_YEAR, getCurrentYear } from '@/hooks/useReports'
import { formatCurrency, round2 } from '@/lib/utils'
import styles from './TaxEstimate.module.scss'

// 2025 SE tax constants
const SE_TAX_RATE        = 0.9235   // 92.35% of net self-employment income is subject to SE tax
const SE_TAX_RATE_FULL   = 0.153    // 15.3% SE tax rate (SS + Medicare)
const SE_DEDUCTION_RATE  = 0.5      // Can deduct 50% of SE tax from income tax
const FEDERAL_BRACKETS = [
  { rate: 0.10, upTo: 11925 },
  { rate: 0.12, upTo: 48475 },
  { rate: 0.22, upTo: 103350 },
  { rate: 0.24, upTo: 197300 },
  { rate: 0.32, upTo: 250525 },
  { rate: 0.35, upTo: 626350 },
  { rate: 0.37, upTo: Infinity },
]
const STANDARD_DEDUCTION = 15000  // 2025 single filer

function calcFederalTax(taxableIncome: number): number {
  let tax = 0
  let prev = 0
  for (const bracket of FEDERAL_BRACKETS) {
    if (taxableIncome <= prev) break
    const chunk = Math.min(taxableIncome, bracket.upTo) - prev
    tax += chunk * bracket.rate
    prev = bracket.upTo
  }
  return Math.max(0, tax)
}

const QUARTERS = [
  { label: 'Q1', months: 'Jan – Mar', deadline: 'Apr 15' },
  { label: 'Q2', months: 'Apr – May', deadline: 'Jun 17' },
  { label: 'Q3', months: 'Jun – Aug', deadline: 'Sep 16' },
  { label: 'Q4', months: 'Sep – Dec', deadline: 'Jan 15' },
]

export default function TaxEstimate() {
  const [year, setYear] = useState(getCurrentYear)
  const YEARS = Array.from({ length: year - FIRST_YEAR + 1 }, (_, i) => getCurrentYear() - i)
  const [otherIncome, setOtherIncome] = useState(0)
  const [filingStatus, setFilingStatus] = useState<'single' | 'mfj'>('single')
  const { data, isLoading, isError } = useReports(year)

  const ytdNet    = data?.months.reduce((s, m) => s + m.netProfit, 0) ?? 0
  const ytdMiles  = data?.months.reduce((s, m) => s + m.totalMiles, 0) ?? 0

  // SE tax calculation
  const netSEIncome    = Math.max(0, ytdNet)
  const seTaxBase      = round2(netSEIncome * SE_TAX_RATE)
  const seTax          = round2(seTaxBase * SE_TAX_RATE_FULL)
  const seDeduction    = round2(seTax * SE_DEDUCTION_RATE)

  // Federal income tax estimate
  const stdDeduction   = filingStatus === 'mfj' ? 30000 : STANDARD_DEDUCTION
  const totalGrossIncome = netSEIncome + otherIncome
  const taxableIncome  = Math.max(0, totalGrossIncome - stdDeduction - seDeduction)
  const federalTax     = calcFederalTax(taxableIncome)
  const totalTax       = seTax + federalTax
  const quarterlyPayment = totalTax / 4

  // Effective rate
  const effectiveRate  = totalGrossIncome > 0
    ? ((totalTax / totalGrossIncome) * 100).toFixed(1)
    : '0.0'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Tax estimate</h1>
          <p className={styles.subtitle}>
            Estimated quarterly self-employment tax based on your logged data.
            Not tax advice — consult a CPA for your actual filing.
          </p>
        </div>
        <select
          className={styles.yearSelect}
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          aria-label="Select tax year"
        >
          {YEARS.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading…</p>
      ) : isError ? (
        <p className={styles.error}>Failed to load tax data. Please refresh the page.</p>
      ) : (
        <>
          {/* Inputs */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Your details</h2>
            <div className={styles.inputGrid}>
              <div className={styles.field}>
                <label className={styles.label}>YTD net profit (from DashTrack)</label>
                <div className={styles.readonlyInput}>
                  {formatCurrency(ytdNet)}
                  <span className={styles.readonlyHint}>auto-calculated</span>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="otherIncome">
                  Other annual income ($)
                </label>
                <input
                  id="otherIncome"
                  type="number"
                  min="0"
                  className={styles.input}
                  value={otherIncome || ''}
                  placeholder="0"
                  onChange={e => setOtherIncome(Number(e.target.value) || 0)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Filing status</label>
                <div className={styles.toggleGroup}>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${filingStatus === 'single' ? styles.active : ''}`}
                    onClick={() => setFilingStatus('single')}
                  >
                    Single
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleBtn} ${filingStatus === 'mfj' ? styles.active : ''}`}
                    onClick={() => setFilingStatus('mfj')}
                  >
                    Married filing jointly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className={styles.resultsGrid}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Tax breakdown</h2>
              <div className={styles.breakdown}>
                <div className={styles.bRow}>
                  <span className={styles.bLabel}>Net SE income</span>
                  <span className={styles.bValue}>{formatCurrency(netSEIncome)}</span>
                </div>
                <div className={styles.bRow}>
                  <span className={styles.bLabel}>SE tax base (× 92.35%)</span>
                  <span className={styles.bValue}>{formatCurrency(seTaxBase)}</span>
                </div>
                <div className={`${styles.bRow} ${styles.bTotal}`}>
                  <span className={styles.bLabel}>SE tax (15.3%)</span>
                  <span className={styles.bValue}>{formatCurrency(seTax)}</span>
                </div>
                <div className={styles.bDivider} />
                <div className={styles.bRow}>
                  <span className={styles.bLabel}>SE deduction (50%)</span>
                  <span className={styles.bValue}>−{formatCurrency(seDeduction)}</span>
                </div>
                <div className={styles.bRow}>
                  <span className={styles.bLabel}>Standard deduction ({filingStatus === 'mfj' ? 'MFJ' : 'single'})</span>
                  <span className={styles.bValue}>−{formatCurrency(stdDeduction)}</span>
                </div>
                <div className={styles.bRow}>
                  <span className={styles.bLabel}>Taxable income</span>
                  <span className={styles.bValue}>{formatCurrency(taxableIncome)}</span>
                </div>
                <div className={`${styles.bRow} ${styles.bTotal}`}>
                  <span className={styles.bLabel}>Estimated federal income tax</span>
                  <span className={styles.bValue}>{formatCurrency(federalTax)}</span>
                </div>
                <div className={styles.bDivider} />
                <div className={`${styles.bRow} ${styles.bGrandTotal}`}>
                  <span className={styles.bLabel}>Total estimated tax</span>
                  <span className={styles.bValue}>{formatCurrency(totalTax)}</span>
                </div>
                <div className={styles.bRow}>
                  <span className={styles.bLabel}>Effective tax rate</span>
                  <span className={styles.bValue}>{effectiveRate}%</span>
                </div>
              </div>
            </div>

            <div className={styles.rightCol}>
              {/* Quarterly payments */}
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Quarterly payments</h2>
                <p className={styles.cardSub}>Pay to the IRS each quarter to avoid underpayment penalties.</p>
                <div className={styles.quarterGrid}>
                  {QUARTERS.map(q => (
                    <div key={q.label} className={styles.quarterCard}>
                      <div className={styles.qLabel}>{q.label} · {q.months}</div>
                      <div className={styles.qAmount}>{formatCurrency(quarterlyPayment)}</div>
                      <div className={styles.qDeadline}>Due {q.deadline}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mileage reminder */}
              {ytdMiles > 0 && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Mileage deduction reminder</h2>
                  <p className={styles.cardSub}>
                    You've logged <strong>{ytdMiles.toLocaleString()} business miles</strong> so far.
                    That's already included in your net profit figure above since mileage is logged as an expense.
                    On Schedule C, report your actual vehicle expenses <em>or</em> the standard mileage deduction — not both.
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className={`${styles.card} ${styles.disclaimer}`}>
                <p>
                  These estimates use 2025 tax rates and the standard deduction for a single filer or MFJ.
                  State income taxes, additional credits, deductions, and filing situations are not included.
                  Always verify with a licensed tax professional or CPA.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
