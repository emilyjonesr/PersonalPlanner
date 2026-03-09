import { useState } from 'react';
import { DAYS } from '../../hooks/useMeals';
import Modal from '../common/Modal';
import styles from './MealPlanWeek.module.css';

export default function MealPlanWeek({ plan, recipes, assignMeal, clearMeal }) {
  const [selecting, setSelecting] = useState(null);

  return (
    <div className={styles.container}>
      {DAYS.map((day) => (
        <div key={day} className={styles.dayCard}>
          <h3 className={styles.dayName}>{day}</h3>
          {['lunch', 'dinner'].map((slot) => {
            const recipeId = plan[day]?.[slot];
            const recipe = recipeId
              ? recipes.find((r) => r.id === recipeId)
              : null;
            return (
              <div key={slot} className={styles.slot}>
                <span className={styles.slotLabel}>{slot}</span>
                {recipe ? (
                  <div className={styles.assigned}>
                    <span>{recipe.name}</span>
                    <button onClick={() => clearMeal(day, slot)}>✕</button>
                  </div>
                ) : (
                  <button
                    className={styles.assignBtn}
                    onClick={() => setSelecting({ day, slot })}
                  >
                    + Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
      <Modal
        open={!!selecting}
        onClose={() => setSelecting(null)}
        title="Pick a Recipe"
      >
        <div className={styles.recipeList}>
          {recipes.length === 0 && (
            <p className={styles.emptyMsg}>
              No recipes yet. Add some in the Recipes tab!
            </p>
          )}
          {recipes.map((r) => (
            <button
              key={r.id}
              className={styles.recipePick}
              onClick={() => {
                assignMeal(selecting.day, selecting.slot, r.id);
                setSelecting(null);
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
