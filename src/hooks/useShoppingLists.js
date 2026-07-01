import { useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { genId } from '../utils/dates';

export default function useShoppingLists() {
  const [shoppingLists, setShoppingLists] = useLocalStorage('shoppingLists', []);

  const addList = useCallback(
    (name) => {
      setShoppingLists((prev) => [...prev, { id: genId(), name, items: [] }]);
    },
    [setShoppingLists],
  );

  const removeList = useCallback(
    (id) => setShoppingLists((prev) => prev.filter((l) => l.id !== id)),
    [setShoppingLists],
  );

  const addItem = useCallback(
    (listId, name) => {
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, items: [...l.items, { id: genId(), name }] }
            : l,
        ),
      );
    },
    [setShoppingLists],
  );

  const removeItem = useCallback(
    (listId, itemId) => {
      setShoppingLists((prev) =>
        prev.map((l) =>
          l.id === listId
            ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
            : l,
        ),
      );
    },
    [setShoppingLists],
  );

  return {
    shoppingLists,
    addList,
    removeList,
    addItem,
    removeItem,
  };
}
