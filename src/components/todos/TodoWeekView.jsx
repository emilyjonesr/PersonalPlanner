import { useMemo } from 'react';
import { today, addDays, toDateStr, formatShortDate } from '../../utils/dates';
import styles from './TodoWeekView.module.css';

export default function TodoWeekView({
  calendarEvents,
  todos,
  toggleTodo,
  removeTodo,
  removeEvent,
}) {
  const todayStr = today();

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => toDateStr(addDays(start, i)));
  }, []);

  return (
    <div className={styles.container}>
      {days.map((dateStr) => {
        const events = calendarEvents[dateStr] || [];
        const dayTodos = todos[dateStr] || [];
        const empty = events.length === 0 && dayTodos.length === 0;

        return (
          <div key={dateStr} className={styles.dayGroup}>
            <h3 className={styles.dayHeader}>
              {formatShortDate(dateStr)}
              {dateStr === todayStr && (
                <span className={styles.todayBadge}>Today</span>
              )}
            </h3>
            {empty && <p className={styles.empty}>Nothing planned</p>}
            {events.map((e) => (
              <div key={e.id} className={styles.event}>
                <span className={styles.eventIcon}>📌</span>
                <span className={styles.eventText}>{e.text}</span>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeEvent(dateStr, e.id)}
                >
                  ✕
                </button>
              </div>
            ))}
            {dayTodos.map((t) => (
              <div key={t.id} className={styles.todo}>
                <label className={styles.todoLabel}>
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={() => toggleTodo(dateStr, t.id)}
                  />
                  <span className={t.done ? styles.done : ''}>{t.text}</span>
                </label>
                <button
                  className={styles.removeBtn}
                  onClick={() => removeTodo(dateStr, t.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
