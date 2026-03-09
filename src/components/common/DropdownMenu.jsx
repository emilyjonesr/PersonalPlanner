import { useEffect, useRef } from 'react';
import styles from './DropdownMenu.module.css';

export default function DropdownMenu({ options, value, onChange, open, onToggle }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onToggle();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onToggle]);

  return (
    <div className={styles.wrapper} ref={ref}>
      <button className={styles.trigger} onClick={onToggle} aria-label="More options">
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div className={styles.menu}>
          {options.map((opt) => (
            <button
              key={opt.value}
              className={`${styles.item} ${value === opt.value ? styles.active : ''}`}
              onClick={() => { onChange(opt.value); onToggle(); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
