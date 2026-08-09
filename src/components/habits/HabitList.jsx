import { useMemo, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './HabitList.module.css';

function SortableHabit({ habit, checked, onToggle, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
    animateLayoutChanges: () => false,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      className={styles.item}
    >
      <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      <label className={styles.label}>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(habit.id)}
        />
        <span className={checked ? styles.done : ''}>{habit.name}</span>
      </label>
      <button className={styles.remove} onClick={() => onRemove(habit.id)}>
        ✕
      </button>
    </li>
  );
}

export default function HabitList({ habits, habitToday, toggleHabit, removeHabit, reorderHabits }) {
  const [activeId, setActiveId] = useState(null);

  const ordered = useMemo(
    () => [...habits].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [habits],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  const handleDragStart = useCallback(({ active }) => {
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (!over || active.id === over.id) return;
      const ids = ordered.map((h) => h.id);
      const from = ids.indexOf(active.id);
      const to = ids.indexOf(over.id);
      if (from === -1 || to === -1) return;
      reorderHabits(arrayMove(ids, from, to));
    },
    [ordered, reorderHabits],
  );

  const activeHabit = ordered.find((h) => h.id === activeId);

  return (
    <div className={styles.container}>
      {habits.length === 0 && (
        <p className={styles.empty}>No habits yet. Tap + Add to get started!</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={ordered.map((h) => h.id)} strategy={verticalListSortingStrategy}>
          <ul className={styles.list}>
            {ordered.map((h) => (
              <SortableHabit
                key={h.id}
                habit={h}
                checked={habitToday.checked.includes(h.id)}
                onToggle={toggleHabit}
                onRemove={removeHabit}
              />
            ))}
          </ul>
        </SortableContext>
        <DragOverlay>
          {activeHabit ? (
            <div className={`${styles.item} ${styles.dragOverlay}`}>
              <span className={styles.dragHandle}>⠿</span>
              <span className={styles.label}>{activeHabit.name}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
