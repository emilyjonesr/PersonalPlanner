import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import styles from './RecipeForm.module.css';

export const MEAT_TAGS = [
  { value: 'Veg',      icon: '🥦', color: 'green'  },
  { value: 'Chicken',  icon: '🍗', color: 'amber'  },
  { value: 'Fish',     icon: '🐟', color: 'blue'   },
  { value: 'Red Meat', icon: '🥩', color: 'red'    },
];

export const BASE_TAGS = [
  { value: 'Rice',  icon: '🍚' },
  { value: 'Salad', icon: '🥗' },
  { value: 'Pasta', icon: '🍝' },
  { value: 'Bread', icon: '🍞' },
];

export default function RecipeForm({ open, onClose, recipe, onSave }) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [newIng, setNewIng] = useState('');
  const [tags, setTags] = useState({});

  useEffect(() => {
    if (recipe) {
      setName(recipe.name);
      setIngredients([...recipe.ingredients]);
      setTags(recipe.tags || {});
    } else {
      setName('');
      setIngredients([]);
      setTags({});
    }
    setNewIng('');
  }, [recipe, open]);

  const toggleTag = (group, value) =>
    setTags((prev) => ({ ...prev, [group]: prev[group] === value ? undefined : value }));

  const addIngredient = () => {
    if (!newIng.trim()) return;
    setIngredients((prev) => [...prev, { name: newIng.trim(), qty: '', unit: '' }]);
    setNewIng('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;
    onSave(name.trim(), ingredients, tags);
  };

  return (
    <Modal open={open} onClose={onClose} title={recipe ? 'Edit Recipe' : 'New Recipe'}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Recipe name"
          className={styles.nameInput}
          autoFocus
        />
        <div className={styles.tagSection}>
          <p className={styles.tagLabel}>Protein</p>
          <div className={styles.tagRow}>
            {MEAT_TAGS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.tag} ${styles[`tag_${t.color}`]}${tags.meat === t.value ? ` ${styles.tagActive}` : ''}`}
                onClick={() => toggleTag('meat', t.value)}
              >
                <span>{t.icon}</span>{t.value}
              </button>
            ))}
          </div>
          <p className={styles.tagLabel}>Base</p>
          <div className={styles.tagRow}>
            {BASE_TAGS.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`${styles.tag} ${styles.tag_base}${tags.base === t.value ? ` ${styles.tagActive}` : ''}`}
                onClick={() => toggleTag('base', t.value)}
              >
                <span>{t.icon}</span>{t.value}
              </button>
            ))}
          </div>
        </div>
        <div className={styles.ingSection}>
          <h4 className={styles.ingTitle}>Ingredients</h4>
          {ingredients.length > 0 && (
            <ul className={styles.ingList}>
              {ingredients.map((ing, i) => (
                <li key={i}>
                  <span>{ing.name}</span>
                  <button
                    type="button"
                    onClick={() => setIngredients((prev) => prev.filter((_, idx) => idx !== i))}
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
                if (e.key === 'Enter') { e.preventDefault(); addIngredient(); }
              }}
            />
            <button type="button" onClick={addIngredient}>+</button>
          </div>
        </div>
        <button type="submit" className={styles.saveBtn}>Save</button>
      </form>
    </Modal>
  );
}
