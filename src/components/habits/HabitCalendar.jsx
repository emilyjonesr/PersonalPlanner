import MonthCalendar from '../common/MonthCalendar';
import { today } from '../../utils/dates';

const CheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" fill="var(--color-primary)" />
    <polyline points="7.5 12 10.5 15 16.5 9" stroke="white" strokeWidth="2" />
  </svg>
);

export default function HabitCalendar({ habitLog, habitToday, habits }) {
  const todayStr = today();

  const isDone = (dateStr) => {
    if (dateStr === todayStr)
      return habits.length > 0 && habits.every((h) => habitToday.checked.includes(h.id));
    return habitLog[dateStr];
  };

  return (
    <MonthCalendar
      renderDay={(dateStr) => isDone(dateStr) ? <CheckIcon /> : null}
    />
  );
}
