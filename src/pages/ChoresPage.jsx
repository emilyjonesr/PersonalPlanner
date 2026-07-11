import { useState } from 'react';
import TopBar from '../components/layout/TopBar';
import Modal from '../components/common/Modal';
import useChores from '../hooks/useChores';
import { getChorePeriod, formatCadence, today, formatShortDate, toDateStr } from '../utils/dates';
import styles from './ChoresPage.module.css';
import pageStyles from './Page.module.css';

function tasksToText(items) {
  return items.map((i) => i.name).join('\n');
}

function ChoreSetCard({ set, choreDone, onToggle, onRemoveSet, onEdit }) {
  const period = getChorePeriod(set.cadence, set.anchor);
  const doneIds = choreDone[set.id]?.[period.key] || [];

  return (
    <div className={`${styles.card}${period.active ? '' : ` ${styles.inactive}`}`}>
      <div className={styles.cardHeader}>
        <div>
          <h3 className={styles.setName}>{set.name}</h3>
          <span className={styles.cadence}>{formatCadence(set.cadence)}</span>
        </div>
        <div className={styles.cardActions}>
          <button className={styles.editSet} onClick={() => onEdit(set)}>Edit</button>
          <button className={styles.deleteSet} onClick={() => onRemoveSet(set.id)}>✕</button>
        </div>
      </div>
      {!period.active && (
        <p className={styles.nextDue}>
          Next: {formatShortDate(toDateStr(period.nextDate))}
        </p>
      )}
      <ul className={styles.itemList}>
        {[...set.items]
          .sort((a, b) => Number(doneIds.includes(a.id)) - Number(doneIds.includes(b.id)))
          .map((item) => (
            <li key={item.id} className={styles.item}>
              <label className={styles.itemLabel}>
                <input
                  type="checkbox"
                  checked={doneIds.includes(item.id)}
                  disabled={!period.active}
                  onChange={() => onToggle(set.id, period.key, item.id)}
                />
                <span className={doneIds.includes(item.id) ? styles.done : ''}>{item.name}</span>
              </label>
            </li>
          ))}
      </ul>
    </div>
  );
}

const emptyForm = () => ({
  name: '',
  tasksText: '',
  unit: 'week',
  interval: 2,
  anchor: today(),
});

export default function ChoresPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const data = useChores();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (set) => {
    setEditingId(set.id);
    setForm({
      name: set.name,
      tasksText: tasksToText(set.items),
      unit: set.cadence.unit,
      interval: set.cadence.interval,
      anchor: set.anchor,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.tasksText.trim()) return;
    const cadence = { unit: form.unit, interval: Number(form.interval) || 1 };
    if (editingId) {
      data.updateSet(editingId, {
        name: form.name.trim(),
        cadence,
        anchor: form.anchor,
        tasksText: form.tasksText,
      });
    } else {
      data.addSet(form.name.trim(), cadence, form.anchor, form.tasksText);
    }
    closeModal();
  };

  return (
    <>
      <TopBar
        title="Chores"
        right={
          <button className={pageStyles.addBtn} onClick={openCreate}>
            + Add
          </button>
        }
      />
      <div className={styles.container}>
        {data.choreSets.length === 0 && (
          <p className={styles.emptyPage}>No chore sets yet. Tap + Add to create one.</p>
        )}
        {data.choreSets.map((set) => (
          <ChoreSetCard
            key={set.id}
            set={set}
            choreDone={data.choreDone}
            onToggle={data.toggleItem}
            onRemoveSet={data.removeSet}
            onEdit={openEdit}
          />
        ))}
      </div>
      <Modal open={modalOpen} onClose={closeModal} title={editingId ? 'Edit Chore Set' : 'New Chore Set'}>
        <form onSubmit={handleSubmit} className={pageStyles.modalForm}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Label (e.g. Week A, Deep clean)"
            className={pageStyles.modalInput}
            autoFocus
          />
          <label className={styles.cadenceLabel}>
            Chores for this week (one per line)
            <textarea
              value={form.tasksText}
              onChange={(e) => setForm((f) => ({ ...f, tasksText: e.target.value }))}
              placeholder={'Wash sheets\nClean shower'}
              className={styles.tasksInput}
              rows={4}
            />
          </label>
          <div className={styles.cadenceRow}>
            <label className={styles.cadenceLabel}>
              Every
              <input
                type="number"
                min="1"
                max="12"
                value={form.interval}
                onChange={(e) => setForm((f) => ({ ...f, interval: e.target.value }))}
                className={styles.intervalInput}
              />
            </label>
            <select
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              className={styles.unitSelect}
            >
              <option value="week">week(s)</option>
              <option value="month">month(s)</option>
            </select>
          </div>
          <label className={styles.cadenceLabel}>
            Start date
            <input
              type="date"
              value={form.anchor}
              onChange={(e) => setForm((f) => ({ ...f, anchor: e.target.value }))}
              className={pageStyles.modalInput}
            />
          </label>
          <button type="submit" className={pageStyles.modalSubmit}>
            {editingId ? 'Save' : 'Create Set'}
          </button>
        </form>
      </Modal>
    </>
  );
}
