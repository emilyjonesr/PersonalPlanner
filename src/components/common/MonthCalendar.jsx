import { useState } from 'react';
import {
  getMonthDays,
  formatMonthYear,
  addMonths,
  toDateStr,
  today,
} from '../../utils/dates';
import styles from './MonthCalendar.module.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function MonthCalendar({ onDayClick, renderDay }) {
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const days = getMonthDays(month);
  const startDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  ).getDay();
  const todayStr = today();

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={() => setMonth((m) => addMonths(m, -1))}>‹</button>
        <span className={styles.monthLabel}>{formatMonthYear(month)}</span>
        <button onClick={() => setMonth((m) => addMonths(m, 1))}>›</button>
      </div>
      <div className={styles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {Array.from({ length: startDay }, (_, i) => (
          <span key={`e-${i}`} />
        ))}
        {days.map((date) => {
          const dateStr = toDateStr(date);
          const isToday = dateStr === todayStr;
          return (
            <button
              key={dateStr}
              className={`${styles.day} ${isToday ? styles.today : ''}`}
              onClick={() => onDayClick?.(dateStr)}
            >
              <span className={styles.dayNum}>{date.getDate()}</span>
              {renderDay?.(dateStr)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
