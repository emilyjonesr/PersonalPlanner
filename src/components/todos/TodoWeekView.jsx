import { useMemo, useCallback, useState, useRef, useLayoutEffect } from 'react';
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
import { UNSCHEDULED } from '../../hooks/useTodos';
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

  // FLIP animation: when this item changes vertical position (e.g. sinks after being checked),
  // animate from the old position to the new one instead of snapping.
  const elRef = useRef(null);
  const prevTopRef = useRef(null);
  const animRef = useRef(null);

  const setRef = useCallback((el) => {
    elRef.current = el;
    setNodeRef(el);
  }, [setNodeRef]);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (isDragging) { prevTopRef.current = null; return; }

    // Skip if our previous FLIP animation is still running — reading mid-animation
    // position would create a conflicting animation from the wrong spot.
    const state = animRef.current?.playState;
    if (state === 'running' || state === 'pending') return;

    const newTop = el.getBoundingClientRect().top;
    if (prevTopRef.current !== null) {
      const delta = prevTopRef.current - newTop;
      if (Math.abs(delta) > 2) {
        animRef.current = el.animate(
          [{ transform: `translateY(${delta}px)` }, { transform: 'none' }],
          { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        );
      }
    }
    prevTopRef.current = newTop;
  });

  return (
    <div
      ref={setRef}
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
  addTodo,
}) {
  const todayStr = today();
  const [active, setActive] = useState(null);
  const [overDate, setOverDate] = useState(null);
  const [backlogText, setBacklogText] = useState('');

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
        if (kind === 'recurring' && toDate === UNSCHEDULED) return;
        if (kind === 'recurring' && fromDate === UNSCHEDULED) return;

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

  const handleBacklogAdd = (e) => {
    e.preventDefault();
    if (!backlogText.trim()) return;
    addTodo(UNSCHEDULED, backlogText.trim());
    setBacklogText('');
  };

  const unscheduledItems = getDayItems(UNSCHEDULED);
  const unscheduledHighlight =
    overDate === UNSCHEDULED && active && active.kind === 'todo' && active.dateStr !== UNSCHEDULED;

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
        <DroppableDayCard dateStr={UNSCHEDULED} highlight={unscheduledHighlight}>
          <h3 className={styles.dayHeader}>Unscheduled</h3>
          <div className={styles.backlogDropArea}>
            <SortableContext
              items={unscheduledItems.map((i) => i.key)}
              strategy={verticalListSortingStrategy}
            >
              {unscheduledItems.map((item) => (
                <SortableItem
                  key={item.key}
                  item={item}
                  dateStr={UNSCHEDULED}
                  isDone={item.todo.done}
                  onToggle={() => toggleTodo(UNSCHEDULED, item.todo.id)}
                  onRemove={() => removeTodo(UNSCHEDULED, item.todo.id)}
                />
              ))}
            </SortableContext>
          </div>
          <form onSubmit={handleBacklogAdd} className={styles.addForm}>
            <input
              type="text"
              value={backlogText}
              onChange={(e) => setBacklogText(e.target.value)}
              placeholder="Add to backlog..."
              className={styles.addInput}
            />
            <button type="submit" className={styles.addBtn}>Add</button>
          </form>
        </DroppableDayCard>
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
