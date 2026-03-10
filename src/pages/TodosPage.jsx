import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import TodoWeekView from '../components/todos/TodoWeekView';
import TodoCalendar from '../components/todos/TodoCalendar';
import TodoForm from '../components/todos/TodoForm';
import useTodos from '../hooks/useTodos';
import { CalendarIcon, ListIcon } from '../components/common/ViewIcons';
import styles from './Page.module.css';

export default function TodosPage() {
  const [view, setView] = useState('week');
  const [formOpen, setFormOpen] = useState(false);
  const data = useTodos();

  return (
    <>
      <TopBar
        title="To Do"
        left={
          <button
            className={styles.viewToggleBtn}
            onClick={() => setView(view === 'week' ? 'calendar' : 'week')}
            aria-label="Toggle view"
          >
            {view === 'week' ? <CalendarIcon /> : <ListIcon />}
          </button>
        }
        right={
          <button className={styles.addBtn} onClick={() => setFormOpen(true)}>
            + Add
          </button>
        }
      />
      {view === 'week' ? <TodoWeekView {...data} /> : <TodoCalendar {...data} />}
      <TodoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onAddTodo={data.addTodo}
        onAddEvent={data.addEvent}
        onAddRecurring={data.addRecurring}
      />
    </>
  );
}
