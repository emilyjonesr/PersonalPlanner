import { useState } from 'react';
import Modal from '../common/Modal';
import { today } from '../../utils/dates';
import styles from './TodoForm.module.css';

export default function TodoForm({ open, onClose, onAddTodo, onAddEvent }) {
  const [type, setType] = useState('todo');
  const [text, setText] = useState('');
  const [date, setDate] = useState(today());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    if (type === 'todo') onAddTodo(date, text.trim());
    else onAddEvent(date, text.trim());
    setText('');
    setDate(today());
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Item">
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'todo' ? styles.active : ''}`}
            onClick={() => setType('todo')}
          >
            To-Do
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${type === 'event' ? styles.active : ''}`}
            onClick={() => setType('event')}
          >
            Event
          </button>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={styles.dateInput}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            type === 'todo' ? 'What do you need to do?' : "What's the event?"
          }
          className={styles.textInput}
          autoFocus
        />
        <button type="submit" className={styles.submit}>
          Add {type === 'todo' ? 'To-Do' : 'Event'}
        </button>
      </form>
    </Modal>
  );
}
