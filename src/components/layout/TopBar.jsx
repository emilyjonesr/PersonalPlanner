import ThemeToggle from '../common/ThemeToggle';
import styles from './TopBar.module.css';

export default function TopBar({ left, right, title }) {
  return (
    <div className={styles.bar}>
      <div className={styles.actions}>
        <div className={styles.side}>
          {left}
          <ThemeToggle />
        </div>
        <div className={styles.side}>{right}</div>
      </div>
      {title && <p className={styles.title}>{title}</p>}
    </div>
  );
}
