import { useState } from 'react';
import MonthCalendar from '../common/MonthCalendar';
import { today, formatShortDate } from '../../utils/dates';
import styles from './TodoCalendar.module.css';

export default function TodoCalendar({
  calendarEvents,
  todos,
  toggleTodo,
  removeTodo,
  removeEvent,
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const todayStr = today();

  const hasItems = (dateStr) =>
    calendarEvents[dateStr]?.length > 0 || todos[dateStr]?.length > 0;

  const events = selectedDate ? calendarEvents[selectedDate] || [] : [];
  const dayTodos = selectedDate ? todos[selectedDate] || [] : [];

  return (
    <div>
      <MonthCalendar
        onDayClick={setSelectedDate}
        renderDay={(dateStr) =>
          hasItems(dateStr) ? <span className={styles.dot} /> : null
        }
      />
      {selectedDate && (
        <div className={styles.details}>
          <h3 className={styles.detailHeader}>
            {formatShortDate(selectedDate)}
            {selectedDate === todayStr && ' — Today'}
          </h3>
          {events.length === 0 && dayTodos.length === 0 && (
            <p className={styles.empty}>Nothing planned</p>
          )}
          {events.map((e) => (
            <div key={e.id} className={styles.event}>
              <span>📌 {e.text}</span>
              <button
                className={styles.removeBtn}
                onClick={() => removeEvent(selectedDate, e.id)}
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
                  onChange={() => toggleTodo(selectedDate, t.id)}
                />
                <span className={t.done ? styles.done : ''}>{t.text}</span>
              </label>
              <button
                className={styles.removeBtn}
                onClick={() => removeTodo(selectedDate, t.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
