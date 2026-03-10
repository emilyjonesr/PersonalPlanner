import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { parseDate } from '../utils/dates';

// days: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
const DEFAULT_RECURRING = [
  { id: 'r-wash-hair', text: 'Wash hair', days: [1, 5] },
  { id: 'r-take-meds', text: 'Take meds', days: [2] },
];

export default function useTodos() {
  const [calendarEvents, setCalendarEvents] = useLocalStorage('calendarEvents', {});
  const [todos, setTodos] = useLocalStorage('todos', {});
  const [recurringTodos, setRecurringTodos] = useLocalStorage('recurringTodos', DEFAULT_RECURRING);
  const [recurringDone, setRecurringDone] = useLocalStorage('recurringDone', {});

  const getRecurringForDate = useCallback(
    (dateStr) => {
      const day = parseDate(dateStr).getDay();
      return recurringTodos.filter((t) => t.days.includes(day));
    },
    [recurringTodos],
  );

  const toggleRecurring = useCallback(
    (dateStr, id) => {
      setRecurringDone((prev) => {
        const dayDone = prev[dateStr] || [];
        return {
          ...prev,
          [dateStr]: dayDone.includes(id)
            ? dayDone.filter((x) => x !== id)
            : [...dayDone, id],
        };
      });
    },
    [setRecurringDone],
  );

  const addRecurring = useCallback(
    (text, days) => {
      setRecurringTodos((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text, days },
      ]);
    },
    [setRecurringTodos],
  );

  const removeRecurring = useCallback(
    (id) => setRecurringTodos((prev) => prev.filter((t) => t.id !== id)),
    [setRecurringTodos],
  );

  const addEvent = useCallback(
    (dateStr, text) => {
      setCalendarEvents((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), { id: crypto.randomUUID(), text }],
      }));
    },
    [setCalendarEvents],
  );

  const removeEvent = useCallback(
    (dateStr, id) => {
      setCalendarEvents((prev) => ({
        ...prev,
        [dateStr]: (prev[dateStr] || []).filter((e) => e.id !== id),
      }));
    },
    [setCalendarEvents],
  );

  const addTodo = useCallback(
    (dateStr, text) => {
      setTodos((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), { id: crypto.randomUUID(), text, done: false }],
      }));
    },
    [setTodos],
  );

  const toggleTodo = useCallback(
    (dateStr, id) => {
      setTodos((prev) => ({
        ...prev,
        [dateStr]: (prev[dateStr] || []).map((t) =>
          t.id === id ? { ...t, done: !t.done } : t,
        ),
      }));
    },
    [setTodos],
  );

  const removeTodo = useCallback(
    (dateStr, id) => {
      setTodos((prev) => ({
        ...prev,
        [dateStr]: (prev[dateStr] || []).filter((t) => t.id !== id),
      }));
    },
    [setTodos],
  );

  return {
    calendarEvents,
    todos,
    recurringDone,
    getRecurringForDate,
    toggleRecurring,
    addRecurring,
    removeRecurring,
    addEvent,
    removeEvent,
    addTodo,
    toggleTodo,
    removeTodo,
  };
}
