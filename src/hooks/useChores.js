import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { genId, today } from '../utils/dates';

function parseTasks(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ id: genId(), name }));
}

export default function useChores() {
  const [choreSets, setChoreSets] = useLocalStorage('choreSets', []);
  const [choreDone, setChoreDone] = useLocalStorage('choreDone', {});

  const addSet = useCallback(
    (name, cadence, anchor, tasksText) => {
      setChoreSets((prev) => [
        ...prev,
        { id: genId(), name, cadence, anchor, items: parseTasks(tasksText) },
      ]);
    },
    [setChoreSets],
  );

  const updateSet = useCallback(
    (id, { name, cadence, anchor, tasksText }) => {
      setChoreSets((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const next = { ...s };
          if (name !== undefined) next.name = name;
          if (cadence !== undefined) next.cadence = cadence;
          if (anchor !== undefined) next.anchor = anchor;
          if (tasksText !== undefined) next.items = parseTasks(tasksText);
          return next;
        }),
      );
    },
    [setChoreSets],
  );

  const removeSet = useCallback(
    (id) => {
      setChoreSets((prev) => prev.filter((s) => s.id !== id));
      setChoreDone((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setChoreSets, setChoreDone],
  );

  const toggleItem = useCallback(
    (setId, periodKey, itemId) => {
      setChoreDone((prev) => {
        const setDone = prev[setId] || {};
        const periodDone = setDone[periodKey] || [];
        const next = periodDone.includes(itemId)
          ? periodDone.filter((x) => x !== itemId)
          : [...periodDone, itemId];
        return {
          ...prev,
          [setId]: { ...setDone, [periodKey]: next },
        };
      });
    },
    [setChoreDone],
  );

  return {
    choreSets,
    choreDone,
    addSet,
    updateSet,
    removeSet,
    toggleItem,
  };
}
