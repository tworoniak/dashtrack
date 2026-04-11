import { useState } from 'react'
import EarningForm from '@/components/log/EarningForm'
import GasForm from '@/components/log/GasForm'
import MileageForm from '@/components/log/MileageForm'
import MaintenanceForm from '@/components/log/MaintenanceForm'
import OtherForm from '@/components/log/OtherForm'
import type { EntryType } from '@/types'
import styles from './Log.module.scss'

const TABS: { type: EntryType; label: string; emoji: string }[] = [
  { type: 'earning',     label: 'Earnings',    emoji: '💵' },
  { type: 'gas',         label: 'Gas',         emoji: '⛽' },
  { type: 'mileage',     label: 'Mileage',     emoji: '🛣️' },
  { type: 'maintenance', label: 'Maintenance', emoji: '🔧' },
  { type: 'other',       label: 'Other',       emoji: '📋' },
]

export default function Log() {
  const [active, setActive] = useState<EntryType>('earning')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Log entry</h1>
        <p className={styles.subtitle}>Record earnings or expenses from today's dash</p>
      </div>

      <div className={styles.card}>
        <div className={styles.tabs} role="tablist" aria-label="Entry type">
          {TABS.map(({ type, label, emoji }) => (
            <button
              key={type}
              role="tab"
              aria-selected={active === type}
              className={`${styles.tab} ${active === type ? styles.activeTab : ''}`}
              onClick={() => setActive(type)}
            >
              <span className={styles.tabEmoji} aria-hidden="true">{emoji}</span>
              {label}
            </button>
          ))}
        </div>

        <div className={styles.formArea}>
          {active === 'earning'     && <EarningForm />}
          {active === 'gas'         && <GasForm />}
          {active === 'mileage'     && <MileageForm />}
          {active === 'maintenance' && <MaintenanceForm />}
          {active === 'other'       && <OtherForm />}
        </div>
      </div>
    </div>
  )
}
