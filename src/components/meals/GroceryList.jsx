import { useState } from 'react';
import styles from './GroceryList.module.css';

export default function GroceryList({
  groceryList,
  removeGroceryItem,
  addGroceryItem,
}) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    addGroceryItem(newItem.trim());
    setNewItem('');
  };

  return (
    <div className={styles.container}>
      {groceryList.length === 0 && (
        <p className={styles.empty}>
          No items — assign meals in the Plan view first
        </p>
      )}
      <ul className={styles.list}>
        {groceryList.map((item, i) => (
          <li key={item.id || i} className={styles.item}>
            <span>
              {item.name}
              {item.qty ? ` (${item.qty}${item.unit ? ` ${item.unit}` : ''})` : ''}
            </span>
            <button
              className={styles.removeBtn}
              onClick={() => removeGroceryItem(item.name)}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className={styles.addForm}>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Add item..."
          className={styles.input}
        />
        <button type="submit" className={styles.addBtn}>
          Add
        </button>
      </form>
    </div>
  );
}
