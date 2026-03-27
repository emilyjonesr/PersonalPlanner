import MonthCalendar from '../common/MonthCalendar';
import { today } from '../../utils/dates';
import styles from './HabitCalendar.module.css';

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" fill="var(--color-primary)" />
    <polyline points="7.5 12 10.5 15 16.5 9" stroke="white" strokeWidth="2" />
  </svg>
);

export default function HabitCalendar({ habitLog, habitToday, habits, toggleHabitLog }) {
  const todayStr = today();

  const isDone = (dateStr) => {
    if (dateStr === todayStr)
      return habits.length > 0 && habits.every((h) => habitToday.checked.includes(h.id));
    return habitLog[dateStr];
  };

  const handleDayClick = (dateStr) => {
    if (dateStr >= todayStr) return;
    toggleHabitLog(dateStr);
  };

  return (
    <>
      <MonthCalendar
        onDayClick={handleDayClick}
        renderDay={(dateStr) => isDone(dateStr) ? <CheckIcon /> : null}
      />
      <p className={styles.hint}>Tap a past day to mark it as completed</p>
    </>
  );
}
