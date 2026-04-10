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
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/log', label: 'Log entry', icon: Car },
  { to: '/earnings', label: 'Earnings', icon: CircleDollarSign },
  { to: '/reports', label: 'Reports', icon: ChartColumnIncreasing },
  { to: '/tax-estimate', label: 'Tax estimate', icon: Landmark },
];

export default function AppLayout() {
  const navigate = useNavigate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.logo}>D</span>
          <span className={styles.brandName}>DashTrack</span>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <Icon size={16} />
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
  );
}
