import { useState } from 'react';
import styles from './CustomList.module.css';

export default function CustomList({ list, onAddItem, onRemoveItem, onRemoveList }) {
  const [newItem, setNewItem] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    onAddItem(list.id, newItem.trim());
    setNewItem('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.deleteList} onClick={() => onRemoveList(list.id)}>
          Delete list
        </button>
      </div>
      {list.items.length === 0 && (
        <p className={styles.empty}>No items yet — add one below</p>
      )}
      <ul className={styles.list}>
        {list.items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span>{item.name}</span>
            <button className={styles.removeBtn} onClick={() => onRemoveItem(list.id, item.id)}>
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
        <button type="submit" className={styles.addBtn}>Add</button>
      </form>
    </div>
  );
}
