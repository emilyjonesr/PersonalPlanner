import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import styles from './RecipeForm.module.css';

export default function RecipeForm({ open, onClose, recipe, onSave }) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [newIng, setNewIng] = useState('');

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setIngredients([...recipe.ingredients]);
    } else {
      setName('');
      setIngredients([]);
    }
    setNewIng('');
  }, [recipe, open]);

  const addIngredient = () => {
    if (!newIng.trim()) return;
    setIngredients((prev) => [
      ...prev,
      { name: newIng.trim(), qty: '', unit: '' },
    ]);
    setNewIng('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;
    onSave(name.trim(), ingredients);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={recipe ? 'Edit Recipe' : 'New Recipe'}
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Recipe name"
          className={styles.nameInput}
          autoFocus
        />
        <div className={styles.ingSection}>
          <h4 className={styles.ingTitle}>Ingredients</h4>
          {ingredients.length > 0 && (
            <ul className={styles.ingList}>
              {ingredients.map((ing, i) => (
                <li key={i}>
                  <span>{ing.name}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setIngredients((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      )
                    }
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.addIng}>
            <input
              type="text"
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              placeholder="Add ingredient"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addIngredient();
                }
              }}
            />
            <button type="button" onClick={addIngredient}>
              +
            </button>
          </div>
        </div>
        <button type="submit" className={styles.saveBtn}>
          Save
        </button>
      </form>
    </Modal>
  );
}
