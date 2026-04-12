import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import styles from './AppLayout.module.scss';
import {
  Car,
  ChartColumnIncreasing,
  CircleDollarSign,
  Landmark,
  LayoutDashboard,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', shortLabel: 'Dash', icon: LayoutDashboard },
  { to: '/log', label: 'Log entry', shortLabel: 'Log', icon: Car },
  { to: '/earnings', label: 'Earnings', shortLabel: 'Earn', icon: CircleDollarSign },
  { to: '/reports', label: 'Reports', shortLabel: 'Reports', icon: ChartColumnIncreasing },
  { to: '/tax-estimate', label: 'Tax estimate', shortLabel: 'Tax', icon: Landmark },
];

export default function AppLayout() {
  const navigate = useNavigate();

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (!error) navigate('/login')
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>D</span>
          <span className={styles.brandName}>DashTrack</span>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <button className={styles.signOut} onClick={handleSignOut} aria-label="Sign out of DashTrack">
          Sign out
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav} aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ to, label, shortLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `${styles.bottomNavItem} ${isActive ? styles.bottomNavActive : ''}`
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span>{shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
