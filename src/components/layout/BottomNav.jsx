import { NavLink } from 'react-router-dom';
import { ListIcon } from '../common/ViewIcons';
import styles from './BottomNav.module.css';


const HabitIcon = ({ active }) => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle
      cx="12" cy="12" r="10"
      fill={active ? 'var(--color-primary)' : 'white'}
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

const MealsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><line x1="7" y1="2" x2="7" y2="11" />
    <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" /><line x1="12" y1="22" x2="12" y2="15" /><path d="M5 22h14" />
  </svg>
);

const tabs = [
  { to: '/todos', label: 'To-Dos', Icon: ListIcon },
  { to: '/habits', label: 'Habits', Icon: HabitIcon, center: true },
  { to: '/meals', label: 'Meals', Icon: MealsIcon },
];

export default function BottomNav() {
  return (
    <nav className={styles.nav}>
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
