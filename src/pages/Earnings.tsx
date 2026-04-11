import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { earningSchema, type EarningSchema } from '@/lib/schemas'
import { formatCurrency } from '@/lib/utils'
import { useDeleteEarning, useEditEarning } from '@/hooks/useEntryActions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import FormField from '@/components/ui/FormField'
import type { Earning } from '@/types'
import styles from './Earnings.module.scss'

const PAGE_SIZE = 20

async function fetchEarnings(page: number): Promise<{ data: Earning[]; count: number }> {
  const from = page * PAGE_SIZE
  const to   = from + PAGE_SIZE - 1

  const { data, error, count } = await supabase
    .from('earnings')
    .select('*', { count: 'exact' })
    .order('dashed_at', { ascending: false })
    .range(from, to)

  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export default function Earnings() {
  const [page, setPage] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['earnings-history', page],
    queryFn: () => fetchEarnings(page),
  })

  const { mutateAsync: deleteEarning, isPending: deleting } = useDeleteEarning()
  const { mutateAsync: editEarning,  isPending: saving   } = useEditEarning()

  const earnings   = data?.data ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const editingRow = earnings.find(e => e.id === editingId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EarningSchema>({
    resolver: zodResolver(earningSchema),
    values: editingRow
      ? {
          amount:       editingRow.amount,
          active_hours: editingRow.active_hours,
          notes:        editingRow.notes ?? '',
          dashed_at:    format(new Date(editingRow.dashed_at), "yyyy-MM-dd'T'HH:mm"),
        }
      : undefined,
  })

  async function onEditSubmit(values: EarningSchema) {
    if (!editingId) return
    await editEarning({ id: editingId, values })
    setEditingId(null)
    reset()
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteEarning(deletingId)
    setDeletingId(null)
  }

  const ytdTotal = earnings.reduce((s, e) => s + e.amount, 0)
  const ytdHours = earnings.reduce((s, e) => s + e.active_hours, 0)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Earnings history</h1>
          <p className={styles.subtitle}>All your logged dashes — edit or delete any entry</p>
        </div>
      </div>

      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total earned (page)</span>
          <span className={styles.statValue}>{formatCurrency(ytdTotal)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total hours (page)</span>
          <span className={styles.statValue}>{ytdHours.toFixed(1)} hrs</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Avg $/hr (page)</span>
          <span className={styles.statValue}>
            {ytdHours > 0 ? formatCurrency(ytdTotal / ytdHours) : '—'}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Total entries</span>
          <span className={styles.statValue}>{totalCount.toLocaleString()}</span>
        </div>
      </div>

      {isLoading ? (
        <p className={styles.loading}>Loading…</p>
      ) : isError ? (
        <p className={styles.error}>Failed to load earnings. Please refresh the page.</p>
      ) : !earnings.length ? (
        <p className={styles.empty}>No earnings logged yet.</p>
      ) : (
        <div className={styles.card}>
          <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th className={styles.right}>Amount</th>
                <th className={styles.right}>Hours</th>
                <th className={styles.right}>$/hr</th>
                <th>Notes</th>
                <th className={styles.actions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map(row => (
                editingId === row.id ? (
                  <tr key={row.id} className={styles.editRow}>
                    <td colSpan={6}>
                      <form className={styles.inlineForm} onSubmit={handleSubmit(onEditSubmit)}>
                        <FormField label="Date" htmlFor="edit-date" error={errors.dashed_at?.message}>
                          <input id="edit-date" type="datetime-local" className={styles.input} {...register('dashed_at')} />
                        </FormField>
                        <FormField label="Amount ($)" htmlFor="edit-amount" error={errors.amount?.message}>
                          <input id="edit-amount" type="number" step="0.01" className={styles.input} {...register('amount')} />
                        </FormField>
                        <FormField label="Hours" htmlFor="edit-hours" error={errors.active_hours?.message}>
                          <input id="edit-hours" type="number" step="0.1" className={styles.input} {...register('active_hours')} />
                        </FormField>
                        <FormField label="Notes" htmlFor="edit-notes">
                          <input id="edit-notes" type="text" className={styles.input} {...register('notes')} />
                        </FormField>
                        <div className={styles.inlineActions}>
                          <button type="submit" className={styles.saveBtn} disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                          </button>
                          <button type="button" className={styles.cancelBtn} onClick={() => { setEditingId(null); reset() }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={row.id}>
                    <td className={styles.dateCell}>{format(new Date(row.dashed_at), 'MMM d, yyyy h:mm a')}</td>
                    <td className={`${styles.right} ${styles.earn}`}>{formatCurrency(row.amount)}</td>
                    <td className={styles.right}>{row.active_hours.toFixed(1)}</td>
                    <td className={styles.right}>{formatCurrency(row.amount / row.active_hours)}</td>
                    <td className={styles.notesCell}>{row.notes ?? '—'}</td>
                    <td className={styles.actions}>
                      <button className={styles.editBtn} onClick={() => setEditingId(row.id)}>Edit</button>
                      <button className={styles.deleteBtn} onClick={() => setDeletingId(row.id)}>Delete</button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>
                Page {page + 1} of {totalPages}
              </span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete entry"
          message="This earning entry will be permanently removed. This cannot be undone."
          confirmLabel={deleting ? 'Deleting…' : 'Delete'}
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
