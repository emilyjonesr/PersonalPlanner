import { useState } from 'react';
import Modal from '../common/Modal';
import { today } from '../../utils/dates';
import styles from './TodoForm.module.css';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function TodoForm({ open, onClose, onAddTodo, onAddEvent, onAddRecurring }) {
  const [type, setType] = useState('todo');
  const [recurring, setRecurring] = useState(false);
  const [text, setText] = useState('');
  const [date, setDate] = useState(today());
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (i) =>
    setSelectedDays((prev) =>
      prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i],
    );

  const reset = () => {
    setText('');
    setDate(today());
    setSelectedDays([]);
    setRecurring(false);
    setType('todo');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (recurring && selectedDays.length > 0) {
      onAddRecurring(text.trim(), selectedDays);
    } else if (type === 'todo') {
      onAddTodo(date, text.trim());
    } else {
      onAddEvent(date, text.trim());
    }
    reset();
    onClose();
  };

  const handleClose = () => { reset(); onClose(); };

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
          placeholder={recurring ? 'What repeats?' : type === 'todo' ? 'What do you need to do?' : "What's the event?"}
          className={styles.textInput}
          autoFocus
        />
        <button type="submit" className={styles.submit}>
          Add {recurring ? 'Recurring' : type === 'todo' ? 'To-Do' : 'Event'}
        </button>
      </form>
    </Modal>
  );
}
