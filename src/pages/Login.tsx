import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './Login.module.scss'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>D</span>
          <span className={styles.name}>DashTrack</span>
        </div>

        {sent ? (
          <div className={styles.sent}>
            <p className={styles.sentTitle}>Check your email</p>
            <p className={styles.sentSub}>We sent a magic link to <strong>{email}</strong></p>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.sub}>We'll send you a magic link — no password needed.</p>

            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className={styles.input}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.btn}
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
