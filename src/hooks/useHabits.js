import { useCallback, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { today, genId } from '../utils/dates';

export default function useHabits() {
  const [habits, setHabits] = useLocalStorage('habits', []);
  const [habitLog, setHabitLog] = useLocalStorage('habitLog', {});
  const [habitToday, setHabitToday] = useLocalStorage('habitToday', {
    date: today(),
    checked: [],
  });

  // Reset at midnight or when tab regains focus
  useEffect(() => {
    const check = () => {
      const currentDate = today();
      if (habitToday.date === currentDate) return;
      const allDone =
        habits.length > 0 &&
        habits.every((h) => habitToday.checked.includes(h.id));
      setHabitLog((prev) => ({ ...prev, [habitToday.date]: allDone }));
      setHabitToday({ date: currentDate, checked: [] });
    };
    check();
    document.addEventListener('visibilitychange', check);
    return () => document.removeEventListener('visibilitychange', check);
  }, [habitToday.date, habits, setHabitLog, setHabitToday, habitToday.checked]);

  const toggleHabit = useCallback(
    (id) => {
      setHabitToday((prev) => ({
        ...prev,
        checked: prev.checked.includes(id)
          ? prev.checked.filter((x) => x !== id)
          : [...prev.checked, id],
      }));
    },
    [setHabitToday],
  );

  const addHabit = useCallback(
    (name) => {
      setHabits((prev) => [
        ...prev,
        { id: genId(), name, order: prev.length },
      ]);
    },
    [setHabits],
  );

  const removeHabit = useCallback(
    (id) => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
    },
    [setHabits],
  );

  return {
    habits,
    habitLog,
    habitToday,
    toggleHabit,
    addHabit,
    removeHabit,
  };
}
