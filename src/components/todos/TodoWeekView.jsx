import { useMemo, useCallback, useState, useRef, useLayoutEffect, useEffect } from 'react';
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

const CHECK_HOLD_MS = 180;
const FLIP_MS = 220;
const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

function DroppableDayCard({ dateStr, highlight, children }) {
  const { setNodeRef } = useDroppable({ id: `day:${dateStr}`, data: { type: 'day', dateStr } });
  return (
    <div ref={setNodeRef} className={`${styles.dayGroup}${highlight ? ` ${styles.dayGroupOver}` : ''}`}>
      {children}
    </div>
  );
}

/** FLIP on inner nodes only — outer node is owned by dnd-kit. */
function useListFlip(itemKeys, listRef, enabled) {
  const prevTopsRef = useRef(new Map());
  const prevSigRef = useRef('');
  const signature = itemKeys.join('\0');

  useLayoutEffect(() => {
    const root = listRef.current;
    if (!root || !enabled) {
      if (!enabled) {
        prevTopsRef.current = new Map();
        prevSigRef.current = '';
      }
      return;
    }

    const nodes = root.querySelectorAll('[data-flip-key]');
    const nextTops = new Map();
    nodes.forEach((el) => {
      nextTops.set(el.getAttribute('data-flip-key'), el.getBoundingClientRect().top);
    });

    const prevSig = prevSigRef.current;
    if (prevSig && prevSig !== signature) {
      nodes.forEach((el) => {
        const key = el.getAttribute('data-flip-key');
        const prevTop = prevTopsRef.current.get(key);
        const newTop = nextTops.get(key);
        if (prevTop == null || newTop == null) return;
        const delta = prevTop - newTop;
        if (Math.abs(delta) < 1) return;
        el.animate(
          [
            { transform: `translateY(${delta}px)` },
            { transform: 'translateY(0)' },
          ],
          { duration: FLIP_MS, easing: FLIP_EASING },
        );
      });
    }

    prevTopsRef.current = nextTops;
    prevSigRef.current = signature;
  }, [signature, enabled, listRef]);
}

function SortableItem({ item, dateStr, isDone, onToggle, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    animateLayoutChanges: () => false,
    data: { kind: item.kind, dateStr, todoId: item.todo.id, text: item.todo.text },
  });

  return (
    // Outer: dnd-kit transform only while dragging
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? transition : undefined,
        opacity: isDragging ? 0 : 1,
      }}
      className={styles.todoSlot}
    >
      {/* Inner: FLIP translateY lives here so it never fights dnd-kit */}
      <div data-flip-key={item.key} className={styles.todo}>
        <span className={styles.dragHandle} {...attributes} {...listeners}>⠿</span>
        <label className={styles.todoLabel}>
          <input type="checkbox" checked={isDone} onChange={onToggle} />
          <span className={`${styles.todoText}${isDone ? ` ${styles.done}` : ''}`}>{item.todo.text}</span>
        </label>
        <button className={styles.removeBtn} onClick={onRemove}>✕</button>
      </div>
    </div>
  );
}

function DayItemList({
  items,
  dateStr,
  getIsDone,
  isDragging,
  onToggle,
  onRemove,
}) {
  const listRef = useRef(null);
  const keys = items.map((i) => i.key);
  useListFlip(keys, listRef, !isDragging);

  return (
    <div ref={listRef}>
      <SortableContext items={keys} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem
            key={item.key}
            item={item}
            dateStr={dateStr}
            isDone={getIsDone(item)}
            onToggle={() => onToggle(item)}
            onRemove={() => onRemove(item)}
          />
        ))}
      </SortableContext>
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
  // Keys checked visually but not yet committed — holds item in place before sink+FLIP
  const [pendingCheck, setPendingCheck] = useState(() => new Set());
  const pendingTimers = useRef(new Map());

  useEffect(() => () => {
    pendingTimers.current.forEach((t) => clearTimeout(t));
    pendingTimers.current.clear();
  }, []);

  const days = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => toDateStr(addDays(start, i)));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const clearPending = useCallback((key) => {
    const t = pendingTimers.current.get(key);
    if (t) clearTimeout(t);
    pendingTimers.current.delete(key);
    setPendingCheck((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const handleToggle = useCallback(
    (item, dateStr, dataDone) => {
      const key = item.key;
      const isRecurring = item.kind === 'recurring';
      const commit = () => {
        if (isRecurring) toggleRecurring(dateStr, item.todo.id);
        else toggleTodo(dateStr, item.todo.id);
      };

      // Cancel in-flight hold if user taps again
      if (pendingTimers.current.has(key)) {
        clearPending(key);
        return;
      }

      if (!dataDone) {
        // Check: show done in place, then sink with FLIP
        setPendingCheck((prev) => new Set(prev).add(key));
        const timer = setTimeout(() => {
          pendingTimers.current.delete(key);
          commit();
          setPendingCheck((prev) => {
            const next = new Set(prev);
            next.delete(key);
            return next;
          });
        }, CHECK_HOLD_MS);
        pendingTimers.current.set(key, timer);
      } else {
        // Uncheck: commit immediately, FLIP slides it back up
        commit();
      }
    },
    [toggleTodo, toggleRecurring, clearPending],
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
        if (kind === 'recurring') {
          const srcItems = getDayItems(fromDate);
          const dragged = srcItems.find((i) => i.key === a.id);
          if (dragged?.todo?.monthDay != null) return;
        }

        const srcKeys = getDayItems(fromDate)
          .map((i) => i.key)
          .filter((k) => k !== a.id);
        const targetKeys = getDayItems(toDate).map((i) => i.key);
        const idx = overIsDay ? targetKeys.length : targetKeys.indexOf(over.id);
        const newTarget = [...targetKeys];
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
  const isDragging = !!active;

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
          const highlight = overDate === dateStr && active && active.dateStr !== dateStr;

          const getIsDone = (item) => {
            if (pendingCheck.has(item.key)) return true;
            return item.kind === 'recurring'
              ? donIds.includes(item.todo.id)
              : item.todo.done;
          };

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
              <DayItemList
                items={items}
                dateStr={dateStr}
                getIsDone={getIsDone}
                isDragging={isDragging}
                onToggle={(item) => {
                  const dataDone = item.kind === 'recurring'
                    ? donIds.includes(item.todo.id)
                    : item.todo.done;
                  handleToggle(item, dateStr, dataDone);
                }}
                onRemove={(item) => {
                  clearPending(item.key);
                  if (item.kind === 'recurring') removeRecurring(item.todo.id);
                  else removeTodo(dateStr, item.todo.id);
                }}
              />
            </DroppableDayCard>
          );
        })}
        <DroppableDayCard dateStr={UNSCHEDULED} highlight={unscheduledHighlight}>
          <h3 className={styles.dayHeader}>Unscheduled</h3>
          <div className={styles.backlogDropArea}>
            <DayItemList
              items={unscheduledItems}
              dateStr={UNSCHEDULED}
              getIsDone={(item) => pendingCheck.has(item.key) || item.todo.done}
              isDragging={isDragging}
              onToggle={(item) => handleToggle(item, UNSCHEDULED, item.todo.done)}
              onRemove={(item) => {
                clearPending(item.key);
                removeTodo(UNSCHEDULED, item.todo.id);
              }}
            />
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
