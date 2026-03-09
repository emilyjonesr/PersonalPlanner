import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import HabitList from '../components/habits/HabitList';
import HabitCalendar from '../components/habits/HabitCalendar';
import Modal from '../components/common/Modal';
import useHabits from '../hooks/useHabits';
import { CalendarIcon, ListIcon } from '../components/common/ViewIcons';
import styles from './Page.module.css';

export default function HabitsPage() {
  const [view, setView] = useState('today');
  const [modalOpen, setModalOpen] = useState(false);
  const [newHabit, setNewHabit] = useState('');
  const data = useHabits();

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newHabit.trim()) return;
    data.addHabit(newHabit.trim());
    setNewHabit('');
    setModalOpen(false);
  };

  return (
    <>
      <TopBar
        title="Daily"
        left={
          <button
            className={styles.viewToggleBtn}
            onClick={() => setView(view === 'today' ? 'calendar' : 'today')}
            aria-label="Toggle view"
          >
            {view === 'today' ? <CalendarIcon /> : <ListIcon />}
          </button>
        }
        right={
          <button className={styles.addBtn} onClick={() => setModalOpen(true)}>
            + Add
          </button>
        }
      />
      {view === 'today' ? <HabitList {...data} /> : <HabitCalendar {...data} />}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Habit">
        <form onSubmit={handleAdd} className={styles.modalForm}>
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="e.g. Read, Exercise..."
            className={styles.modalInput}
            autoFocus
          />
          <button type="submit" className={styles.modalSubmit}>Add Habit</button>
        </form>
      </Modal>
    </>
  );
}
