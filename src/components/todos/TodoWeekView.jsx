import { useMemo, useCallback, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { today, addDays, toDateStr, formatShortDate } from '../../utils/dates';
import styles from './TodoWeekView.module.css';

function DroppableDayCard({ dateStr, highlight, children }) {
  const { setNodeRef } = useDroppable({ id: `day:${dateStr}`, data: { type: 'day', dateStr } });
  return (
    <div ref={setNodeRef} className={`${styles.dayGroup}${highlight ? ` ${styles.dayGroupOver}` : ''}`}>
      {children}
    </div>
  );
}

function SortableItem({ item, dateStr, isDone, onToggle, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    data: { kind: item.kind, dateStr, todoId: item.todo.id, text: item.todo.text },
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      className={styles.todo}
    >
      <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
      <label className={styles.todoLabel}>
        <input type="checkbox" checked={isDone} onChange={onToggle} />
        <span className={isDone ? styles.done : ''}>{item.todo.text}</span>
      </label>
      <button className={styles.removeBtn} onClick={onRemove}>✕</button>
    </div>
  );
}

export default function TodoWeekView({
  calendarEvents,
  recurringDone,
  getDayItems,
  setDayOrder,
  toggleTodo,
  removeTodo,
  removeEvent,
  toggleRecurring,
  removeRecurring,
  moveTodo,
  moveRecurringDay,
}) {
  const todayStr = today();
  const [active, setActive] = useState(null); // { id, kind, dateStr, text }
  const [overDate, setOverDate] = useState(null);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => toDateStr(addDays(start, i)));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleDragStart = useCallback(({ active: a }) => {
    setActive({ id: a.id, ...a.data.current });
  }, []);

  const handleDragOver = useCallback(({ over }) => {
    setOverDate(over?.data.current?.dateStr ?? null);
  }, []);

  const handleDragEnd = useCallback(
    ({ active: a, over }) => {
      setActive(null);
      setOverDate(null);
      if (!over) return;
      const fromDate = a.data.current?.dateStr;
      const kind = a.data.current?.kind;
      if (!fromDate) return;

      const overIsDay = over.data.current?.type === 'day';
      const toDate = over.data.current?.dateStr;
      if (!toDate) return;

      if (fromDate === toDate) {
        if (overIsDay || a.id === over.id) return;
        const keys = getDayItems(fromDate).map((i) => i.key);
        const from = keys.indexOf(a.id);
        const to = keys.indexOf(over.id);
        if (from === -1 || to === -1) return;
        setDayOrder(fromDate, arrayMove(keys, from, to));
      } else {
        // Capture current orders BEFORE the move (state updates are async).
        const srcKeys = getDayItems(fromDate)
          .map((i) => i.key)
          .filter((k) => k !== a.id);
        const targetKeys = getDayItems(toDate).map((i) => i.key);
        const idx = overIsDay ? targetKeys.length : targetKeys.indexOf(over.id);
        const newTarget = [...targetKeys];
        // Recurring keys embed the date, so the key in the target day differs from a.id.
        const insertKey =
          kind === 'recurring' ? `r:${toDate}:${a.data.current.todoId}` : a.id;
        newTarget.splice(idx < 0 ? targetKeys.length : idx, 0, insertKey);

        if (kind === 'recurring') {
          moveRecurringDay(a.data.current.todoId, fromDate, toDate);
        } else {
          moveTodo(fromDate, toDate, a.id);
        }
        setDayOrder(fromDate, srcKeys);
        setDayOrder(toDate, newTarget);
      }
    },
    [getDayItems, setDayOrder, moveTodo, moveRecurringDay],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActive(null); setOverDate(null); }}
    >
      <div className={styles.container}>
        {days.map((dateStr) => {
          const events = calendarEvents[dateStr] || [];
          const items = getDayItems(dateStr);
          const donIds = recurringDone[dateStr] || [];
          const empty = events.length === 0 && items.length === 0;
          // Highlight the destination box on any cross-day move.
          const highlight = overDate === dateStr && active && active.dateStr !== dateStr;

          return (
            <DroppableDayCard key={dateStr} dateStr={dateStr} highlight={highlight}>
              <h3 className={styles.dayHeader}>
                {formatShortDate(dateStr)}
                {dateStr === todayStr && <span className={styles.todayBadge}>Today</span>}
              </h3>
              {empty && <p className={styles.empty}>Nothing planned</p>}
              {events.map((e) => (
                <div key={e.id} className={styles.event}>
                  <span className={styles.eventIcon}>📌</span>
                  <span className={styles.eventText}>{e.text}</span>
                  <button className={styles.removeBtn} onClick={() => removeEvent(dateStr, e.id)}>✕</button>
                </div>
              ))}
              <SortableContext items={items.map((i) => i.key)} strategy={verticalListSortingStrategy}>
                {items.map((item) => {
                  const isRecurring = item.kind === 'recurring';
                  const isDone = isRecurring ? donIds.includes(item.todo.id) : item.todo.done;
                  return (
                    <SortableItem
                      key={item.key}
                      item={item}
                      dateStr={dateStr}
                      isDone={isDone}
                      onToggle={() =>
                        isRecurring
                          ? toggleRecurring(dateStr, item.todo.id)
                          : toggleTodo(dateStr, item.todo.id)
                      }
                      onRemove={() =>
                        isRecurring
                          ? removeRecurring(item.todo.id)
                          : removeTodo(dateStr, item.todo.id)
                      }
                    />
                  );
                })}
              </SortableContext>
            </DroppableDayCard>
          );
        })}
      </div>
      <DragOverlay>
        {active ? (
          <div className={`${styles.todo} ${styles.dragOverlay}`}>
            <span className={styles.dragHandle}>⠿</span>
            <span className={styles.todoLabel}>{active.text}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
