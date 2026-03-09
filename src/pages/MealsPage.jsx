import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import DropdownMenu from '../components/common/DropdownMenu';
import MealPlanWeek from '../components/meals/MealPlanWeek';
import GroceryList from '../components/meals/GroceryList';
import RecipeList from '../components/meals/RecipeList';
import useMeals from '../hooks/useMeals';
import { formatWeekLabel } from '../utils/dates';
import styles from './MealsPage.module.css';

const VIEW_OPTIONS = [
  { value: 'plan', label: 'Meals' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'recipes', label: 'Recipes' },
];

const VIEW_LABELS = { plan: 'Meals', groceries: 'Groceries', recipes: 'Recipes' };

export default function MealsPage() {
  const [view, setView] = useState('plan');
  const [menuOpen, setMenuOpen] = useState(false);
  const data = useMeals();

  return (
    <>
      <TopBar
        title={VIEW_LABELS[view]}
        right={
          <DropdownMenu
            options={VIEW_OPTIONS}
            value={view}
            onChange={setView}
            open={menuOpen}
            onToggle={() => setMenuOpen((o) => !o)}
          />
        }
      />
      {view === 'plan' && <MealPlanWeek {...data} />}
      {view === 'groceries' && <GroceryList {...data} />}
      {view === 'recipes' && <RecipeList {...data} />}
      {view !== 'recipes' && (
        <div className={styles.weekNav}>
          <button onClick={() => data.navigateWeek(-1)}>‹</button>
          <span className={styles.weekLabel}>{formatWeekLabel(data.currentWeek)}</span>
          <button onClick={() => data.navigateWeek(1)}>›</button>
        </div>
      )}
    </>
  );
}
