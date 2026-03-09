import { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog ref={ref} className={styles.modal} onClose={onClose}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button className={styles.close} onClick={onClose}>
          ✕
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </dialog>
  );
}
