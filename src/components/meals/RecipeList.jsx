import { useState } from 'react';
import RecipeForm, { MEAT_TAGS, BASE_TAGS } from './RecipeForm';
import styles from './RecipeList.module.css';

function TagBadge({ group, value }) {
  const def =
    group === 'meat'
      ? MEAT_TAGS.find((t) => t.value === value)
      : BASE_TAGS.find((t) => t.value === value);
  if (!def) return null;
  const colorClass = group === 'meat' ? styles[`badge_${def.color}`] : styles.badge_base;
  return (
    <span className={`${styles.tag} ${colorClass}`}>
      {def.icon} {value}
    </span>
  );
}

export default function RecipeList({
  recipes,
  addRecipe,
  updateRecipe,
  removeRecipe,
}) {
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);

  return (
    <div className={styles.container}>
      <button className={styles.newBtn} onClick={() => setEditing('new')}>
        + New Recipe
      </button>
      {recipes.length === 0 && (
        <p className={styles.empty}>No recipes yet. Add your first one!</p>
      )}
      {recipes.map((r) => (
        <div key={r.id} className={styles.card}>
          <button
            className={styles.cardHeader}
            onClick={() => setExpanded(expanded === r.id ? null : r.id)}
          >
            <span className={styles.name}>{r.name}</span>
            <div className={styles.cardMeta}>
              {(r.tags?.meat || r.tags?.base) && (
                <span className={styles.tags}>
                  {r.tags.meat && <TagBadge group="meat" value={r.tags.meat} />}
                  {r.tags.base && <TagBadge group="base" value={r.tags.base} />}
                </span>
              )}
              <span className={styles.count}>
                {r.ingredients.length} item{r.ingredients.length !== 1 ? 's' : ''}
              </span>
            </div>
          </button>
          {expanded === r.id && (
            <div className={styles.details}>
              <ul className={styles.ingredients}>
                {r.ingredients.map((ing, i) => (
                  <li key={i}>
                    {ing.name}
                    {ing.qty
                      ? ` — ${ing.qty}${ing.unit ? ` ${ing.unit}` : ''}`
                      : ''}
                  </li>
                ))}
              </ul>
              <div className={styles.actions}>
                <button onClick={() => setEditing(r)}>Edit</button>
                <button
                  className={styles.danger}
                  onClick={() => removeRecipe(r.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
      <RecipeForm
        open={editing !== null}
        onClose={() => setEditing(null)}
        recipe={editing !== 'new' ? editing : null}
        onSave={(name, ingredients, tags) => {
          if (editing && editing !== 'new')
            updateRecipe(editing.id, name, ingredients, tags);
          else addRecipe(name, ingredients, tags);
          setEditing(null);
        }}
      />
    </div>
  );
}
