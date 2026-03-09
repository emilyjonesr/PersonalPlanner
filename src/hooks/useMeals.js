import { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './useLocalStorage';
import { toDateStr, getWeekStart, addDays } from '../utils/dates';

export const DAYS = [
  'Saturday',
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

export default function useMeals() {
  const [recipes, setRecipes] = useLocalStorage('recipes', []);
  const [mealPlans, setMealPlans] = useLocalStorage('mealPlans', {});
  const [groceryOverrides, setGroceryOverrides] = useLocalStorage(
    'groceryOverrides',
    {},
  );
  const [currentWeek, setCurrentWeek] = useState(() => getWeekStart());

  const weekKey = toDateStr(currentWeek);
  const plan = mealPlans[weekKey] || {};

  const navigateWeek = useCallback((dir) => {
    setCurrentWeek((prev) => addDays(prev, dir * 7));
  }, []);

  const addRecipe = useCallback(
    (name, ingredients) => {
      setRecipes((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name, ingredients },
      ]);
    },
    [setRecipes],
  );

  const updateRecipe = useCallback(
    (id, name, ingredients) => {
      setRecipes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name, ingredients } : r)),
      );
    },
    [setRecipes],
  );

  const removeRecipe = useCallback(
    (id) => {
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    },
    [setRecipes],
  );

  const assignMeal = useCallback(
    (day, slot, recipeId) => {
      setMealPlans((prev) => ({
        ...prev,
        [weekKey]: {
          ...prev[weekKey],
          [day]: { ...(prev[weekKey]?.[day] || {}), [slot]: recipeId },
        },
      }));
    },
    [setMealPlans, weekKey],
  );

  const clearMeal = useCallback(
    (day, slot) => {
      setMealPlans((prev) => ({
        ...prev,
        [weekKey]: {
          ...prev[weekKey],
          [day]: { ...(prev[weekKey]?.[day] || {}), [slot]: null },
        },
      }));
    },
    [setMealPlans, weekKey],
  );

  const groceryList = useMemo(() => {
    const ingredients = {};
    for (const day of DAYS) {
      for (const slot of ['lunch', 'dinner']) {
        const recipeId = plan[day]?.[slot];
        if (!recipeId) continue;
        const recipe = recipes.find((r) => r.id === recipeId);
        if (!recipe) continue;
        for (const ing of recipe.ingredients) {
          const key = ing.name.toLowerCase();
          if (!ingredients[key]) {
            ingredients[key] = { name: ing.name, qty: ing.qty, unit: ing.unit };
          }
        }
      }
    }
    const overrides = groceryOverrides[weekKey] || {
      removed: [],
      added: [],
    };
    const items = Object.values(ingredients).filter(
      (i) => !overrides.removed.includes(i.name.toLowerCase()),
    );
    return [...items, ...(overrides.added || [])];
  }, [plan, recipes, groceryOverrides, weekKey]);

  const removeGroceryItem = useCallback(
    (name) => {
      setGroceryOverrides((prev) => ({
        ...prev,
        [weekKey]: {
          removed: [...(prev[weekKey]?.removed || []), name.toLowerCase()],
          added: prev[weekKey]?.added || [],
        },
      }));
    },
    [setGroceryOverrides, weekKey],
  );

  const addGroceryItem = useCallback(
    (name) => {
      setGroceryOverrides((prev) => ({
        ...prev,
        [weekKey]: {
          removed: prev[weekKey]?.removed || [],
          added: [
            ...(prev[weekKey]?.added || []),
            { id: crypto.randomUUID(), name, qty: '', unit: '' },
          ],
        },
      }));
    },
    [setGroceryOverrides, weekKey],
  );

  return {
    recipes,
    currentWeek,
    weekKey,
    plan,
    groceryList,
    navigateWeek,
    addRecipe,
    updateRecipe,
    removeRecipe,
    assignMeal,
    clearMeal,
    removeGroceryItem,
    addGroceryItem,
  };
}
