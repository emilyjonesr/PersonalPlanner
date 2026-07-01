import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { parseDate, genId } from '../utils/dates';

export const UNSCHEDULED = 'unscheduled';

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
  const [todoOrder, setTodoOrder] = useLocalStorage('todoOrder', {});

  const getRecurringForDate = useCallback(
    (dateStr) => {
      const day = parseDate(dateStr).getDay();
      return recurringTodos.filter((t) => t.days.includes(day));
    },
    [recurringTodos],
  );

  // Unified, ordered list of a day's items (recurring + regular). Events are separate.
  // key = todo.id for regular, "r:<id>" for recurring. New items append after the saved order.
  const getDayItems = useCallback(
    (dateStr) => {
      const recurring = getRecurringForDate(dateStr).map((t) => ({
        key: `r:${dateStr}:${t.id}`,
        kind: 'recurring',
        todo: t,
      }));
      const regular = (todos[dateStr] || []).map((t) => ({
        key: t.id,
        kind: 'todo',
        todo: t,
      }));
      const all = [...recurring, ...regular];
      const order = todoOrder[dateStr];
      if (!order) return all;
      const byKey = new Map(all.map((i) => [i.key, i]));
      const ordered = [];
      order.forEach((k) => {
        if (byKey.has(k)) {
          ordered.push(byKey.get(k));
          byKey.delete(k);
        }
      });
      byKey.forEach((i) => ordered.push(i));
      return ordered;
    },
    [todos, getRecurringForDate, todoOrder],
  );

  const setDayOrder = useCallback(
    (dateStr, keys) => setTodoOrder((prev) => ({ ...prev, [dateStr]: keys })),
    [setTodoOrder],
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
        { id: genId(), text, days },
      ]);
    },
    [setRecurringTodos],
  );

  const removeRecurring = useCallback(
    (id) => setRecurringTodos((prev) => prev.filter((t) => t.id !== id)),
    [setRecurringTodos],
  );

  // Moves a recurring item's occurrence from one weekday to another by editing its days.
  const moveRecurringDay = useCallback(
    (id, fromDate, toDate) => {
      const fromDow = parseDate(fromDate).getDay();
      const toDow = parseDate(toDate).getDay();
      if (fromDow === toDow) return;
      setRecurringTodos((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const days = t.days.filter((d) => d !== fromDow);
          if (!days.includes(toDow)) days.push(toDow);
          return { ...t, days };
        }),
      );
    },
    [setRecurringTodos],
  );

  const addEvent = useCallback(
    (dateStr, text) => {
      setCalendarEvents((prev) => ({
        ...prev,
        [dateStr]: [...(prev[dateStr] || []), { id: genId(), text }],
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
        [dateStr]: [...(prev[dateStr] || []), { id: genId(), text, done: false }],
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

  const moveTodo = useCallback(
    (fromDate, toDate, id) => {
      setTodos((prev) => {
        const item = (prev[fromDate] || []).find((t) => t.id === id);
        if (!item) return prev;
        return {
          ...prev,
          [fromDate]: (prev[fromDate] || []).filter((t) => t.id !== id),
          [toDate]: [...(prev[toDate] || []), item],
        };
      });
    },
    [setTodos],
  );

  return {
    calendarEvents,
    todos,
    recurringDone,
    getRecurringForDate,
    getDayItems,
    setDayOrder,
    toggleRecurring,
    addRecurring,
    removeRecurring,
    moveRecurringDay,
    addEvent,
    removeEvent,
    addTodo,
    toggleTodo,
    removeTodo,
    moveTodo,
  };
}
