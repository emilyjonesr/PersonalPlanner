import { NavLink } from 'react-router-dom';
import { ListIcon } from '../common/ViewIcons';
import styles from './BottomNav.module.css';

const HabitIcon = ({ active }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle
      cx="12" cy="12" r="10"
      fill={active ? 'var(--color-primary)' : 'var(--color-surface)'}
      stroke="var(--color-primary)"
      strokeWidth="1.5"
    />
    <polyline
      points="7.5 12 10.5 15 16.5 9"
      stroke={active ? 'white' : 'var(--color-primary)'}
      strokeWidth="2"
    />
  </svg>
);

const ChoresIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2l4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="M7 22l-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </svg>
);

const ShoppingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const MealsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><line x1="7" y1="2" x2="7" y2="11" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" /><line x1="12" y1="22" x2="12" y2="15" /><path d="M5 22h14" />
  </svg>
);

const tabs = [
  { to: '/todos', label: 'To-Dos', Icon: ListIcon },
  { to: '/chores', label: 'Chores', Icon: ChoresIcon },
  { to: '/habits', label: 'Daily', Icon: HabitIcon, center: true },
  { to: '/shopping', label: 'Shopping', Icon: ShoppingIcon },
  { to: '/meals', label: 'Meals', Icon: MealsIcon },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav} data-bottom-nav>
      {tabs.map(({ to, label, Icon, center }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            [styles.tab, center && styles.centerTab, isActive && styles.active]
              .filter(Boolean)
              .join(' ')
          }
        >
          {({ isActive }) =>
            center ? (
              <span className={styles.centerIcon}>
                <Icon active={isActive} />
              </span>
            ) : (
              <>
                <Icon />
                <span className={styles.label}>{label}</span>
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
