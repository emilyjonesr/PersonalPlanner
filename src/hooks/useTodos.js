import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

export default function useTodos() {
  const [calendarEvents, setCalendarEvents] = useLocalStorage(
    'calendarEvents',
    {},
  );
  const [todos, setTodos] = useLocalStorage('todos', {});

  const addEvent = useCallback(
    (dateStr, text) => {
      setCalendarEvents((prev) => ({
        ...prev,
        [dateStr]: [
          ...(prev[dateStr] || []),
          { id: crypto.randomUUID(), text },
        ],
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
        [dateStr]: [
          ...(prev[dateStr] || []),
          { id: crypto.randomUUID(), text, done: false },
        ],
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
    addEvent,
    removeEvent,
    addTodo,
    toggleTodo,
    removeTodo,
  };
}
