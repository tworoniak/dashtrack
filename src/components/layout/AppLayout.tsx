import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import styles from './AppLayout.module.scss'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/log',          label: 'Log entry' },
  { to: '/earnings',     label: 'Earnings' },
  { to: '/reports',      label: 'Reports' },
  { to: '/tax-estimate', label: 'Tax estimate' },
]

export default function AppLayout() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>D</span>
          <span className={styles.brandName}>DashTrack</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className={styles.signOut} onClick={handleSignOut}>
          Sign out
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
