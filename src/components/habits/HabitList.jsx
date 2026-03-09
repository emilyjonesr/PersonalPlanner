import styles from './HabitList.module.css';

export default function HabitList({ habits, habitToday, toggleHabit, removeHabit }) {

  return (
    <div className={styles.container}>
      {habits.length === 0 && (
        <p className={styles.empty}>No habits yet. Tap + Add to get started!</p>
      )}
      <ul className={styles.list}>
        {habits.map((h) => {
          const checked = habitToday.checked.includes(h.id);
          return (
            <li key={h.id} className={styles.item}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleHabit(h.id)}
                />
                <span className={checked ? styles.done : ''}>{h.name}</span>
              </label>
              <button className={styles.remove} onClick={() => removeHabit(h.id)}>
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
