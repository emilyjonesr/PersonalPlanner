import { useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { parseDate, genId, today } from '../utils/dates';

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
      const date = parseDate(dateStr);
      const dow = date.getDay();
      const dom = date.getDate();
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
      return recurringTodos.filter((t) => {
        if (t.monthDay != null) {
          return Math.min(t.monthDay, lastDay) === dom;
        }
        return Array.isArray(t.days) && t.days.includes(dow);
      });
    },
    [recurringTodos],
  );

  // Unified, ordered list of a day's items (recurring + regular). Events are separate.
  // key = todo.id for regular, "r:<dateStr>:<id>" for recurring. New items append after saved order.
  // Done items always sort to the bottom within their existing order.
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
      let ordered;
      if (!order) {
        ordered = all;
      } else {
        const byKey = new Map(all.map((i) => [i.key, i]));
        ordered = [];
        order.forEach((k) => {
          if (byKey.has(k)) { ordered.push(byKey.get(k)); byKey.delete(k); }
        });
        byKey.forEach((i) => ordered.push(i));
      }
      const doneIds = new Set(recurringDone[dateStr] || []);
      const isDone = (item) =>
        item.kind === 'todo' ? item.todo.done : doneIds.has(item.todo.id);
      return ordered.sort((a, b) => Number(isDone(a)) - Number(isDone(b)));
    },
    [todos, getRecurringForDate, todoOrder, recurringDone],
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
    (text, opts) => {
      const item = { id: genId(), text };
      if (opts && opts.monthDay != null) {
        item.monthDay = Math.min(31, Math.max(1, Number(opts.monthDay) || 1));
      } else {
        item.days = Array.isArray(opts?.days) ? opts.days : (Array.isArray(opts) ? opts : []);
      }
      setRecurringTodos((prev) => [...prev, item]);
    },
    [setRecurringTodos],
  );

  const removeRecurring = useCallback(
    (id) => setRecurringTodos((prev) => prev.filter((t) => t.id !== id)),
    [setRecurringTodos],
  );

  // Moves a recurring item's occurrence from one weekday to another by editing its days.
  // Monthly (day-of-month) items are not rewritten by drag.
  const moveRecurringDay = useCallback(
    (id, fromDate, toDate) => {
      const fromDow = parseDate(fromDate).getDay();
      const toDow = parseDate(toDate).getDay();
      if (fromDow === toDow) return;
      setRecurringTodos((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          if (t.monthDay != null) return t;
          const days = (t.days || []).filter((d) => d !== fromDow);
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

  // On first open of each new day: carry all past undone items to today,
  // then delete all past-date entries (we don't need them after that).
  useEffect(() => {
    const PUNT_KEY = 'lastPuntDate';
    const todayStr = today();
    const alreadyPunted = localStorage.getItem(PUNT_KEY) === todayStr;

    setTodos((prev) => {
      const pastDates = Object.keys(prev).filter(
        (d) => d !== UNSCHEDULED && d < todayStr,
      );
      if (!pastDates.length) return prev;
      const next = { ...prev };
      if (!alreadyPunted) {
        const allUndone = pastDates.flatMap((d) => (prev[d] || []).filter((t) => !t.done));
        if (allUndone.length) next[todayStr] = [...(next[todayStr] || []), ...allUndone];
      }
      pastDates.forEach((d) => delete next[d]);
      return next;
    });
    setTodoOrder((prev) => {
      const pastDates = Object.keys(prev).filter(
        (d) => d !== UNSCHEDULED && d < todayStr,
      );
      if (!pastDates.length) return prev;
      const next = { ...prev };
      pastDates.forEach((d) => delete next[d]);
      return next;
    });

    if (!alreadyPunted) localStorage.setItem(PUNT_KEY, todayStr);
  }, [setTodos, setTodoOrder]); // stable setters — runs effectively once on mount

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
