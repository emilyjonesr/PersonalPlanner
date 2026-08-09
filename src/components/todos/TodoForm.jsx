import { useState } from 'react';
import Modal from '../common/Modal';
import { today } from '../../utils/dates';
import styles from './TodoForm.module.css';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function TodoForm({ open, onClose, onAddTodo, onAddEvent, onAddRecurring }) {
  const [type, setType] = useState('todo');
  const [recurring, setRecurring] = useState(false);
  const [recurMode, setRecurMode] = useState('weekly'); // 'weekly' | 'monthly'
  const [text, setText] = useState('');
  const [date, setDate] = useState(today());
  const [selectedDays, setSelectedDays] = useState([]);
  const [monthDay, setMonthDay] = useState(1);

  const toggleDay = (i) =>
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
    );

  const reset = () => {
    setText('');
    setDate(today());
    setSelectedDays([]);
    setMonthDay(1);
    setRecurMode('weekly');
    setRecurring(false);
    setType('todo');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (recurring) {
      if (recurMode === 'monthly') {
        const day = Math.min(31, Math.max(1, Number(monthDay) || 1));
        onAddRecurring(text.trim(), { monthDay: day });
      } else if (selectedDays.length > 0) {
        onAddRecurring(text.trim(), { days: selectedDays });
      } else {
        return;
      }
    } else if (type === 'todo') {
      onAddTodo(date, text.trim());
    } else {
      onAddEvent(date, text.trim());
    }
    reset();
    onClose();
  };

  const handleClose = () => { reset(); onClose(); };

  const canSubmit = text.trim() && (
    !recurring
    || (recurMode === 'weekly' && selectedDays.length > 0)
    || recurMode === 'monthly'
  );

  return (
    <Modal open={open} onClose={handleClose} title="Add Item">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.typeRow}>
          <div className={styles.typeToggle}>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'todo' && !recurring ? styles.active : ''}`}
              onClick={() => { setType('todo'); setRecurring(false); }}
            >
              To-Do
            </button>
            <button
              type="button"
              className={`${styles.typeBtn} ${type === 'event' ? styles.active : ''}`}
              onClick={() => { setType('event'); setRecurring(false); }}
            >
              Event
            </button>
          </div>
          <button
            type="button"
            className={`${styles.recurringBtn} ${recurring ? styles.recurringActive : ''}`}
            onClick={() => { setRecurring((r) => !r); setType('todo'); }}
            title="Recurring"
          >
            ↻
          </button>
        </div>

        {recurring ? (
          <>
            <div className={styles.typeToggle}>
              <button
                type="button"
                className={`${styles.typeBtn} ${recurMode === 'weekly' ? styles.active : ''}`}
                onClick={() => setRecurMode('weekly')}
              >
                Weekly
              </button>
              <button
                type="button"
                className={`${styles.typeBtn} ${recurMode === 'monthly' ? styles.active : ''}`}
                onClick={() => setRecurMode('monthly')}
              >
                Monthly
              </button>
            </div>
            {recurMode === 'weekly' ? (
              <div className={styles.dayPicker}>
                {DAYS.map((label, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.dayBtn} ${selectedDays.includes(i) ? styles.dayActive : ''}`}
                    onClick={() => toggleDay(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <label className={styles.monthDayRow}>
                <span className={styles.monthDayLabel}>Day of month</span>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={monthDay}
                  onChange={(e) => setMonthDay(e.target.value)}
                  className={styles.monthDayInput}
                />
              </label>
            )}
          </>
        ) : (
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.dateInput}
          />
        )}

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            recurring
              ? (recurMode === 'monthly' ? 'e.g. Pay bills' : 'What repeats?')
              : type === 'todo'
                ? 'What do you need to do?'
                : "What's the event?"
          }
          className={styles.textInput}
          autoFocus
        />
        <button type="submit" className={styles.submit} disabled={!canSubmit}>
          Add {recurring ? 'Recurring' : type === 'todo' ? 'To-Do' : 'Event'}
        </button>
      </form>
    </Modal>
  );
}
