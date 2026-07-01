export const genId = () =>
  crypto.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

export function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  return toDateStr(new Date());
}

export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function formatShortDate(dateStr) {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function addDays(date, n) {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

export function getMonthDays(monthStart) {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const days = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// Sat-Fri week: returns the Saturday that starts the current week
export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const offset = (day + 1) % 7;
  d.setDate(d.getDate() - offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatWeekLabel(weekStart) {
  return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function isOlderThan(dateStr, days) {
  const date = parseDate(dateStr);
  const cutoff = addDays(new Date(), -days);
  cutoff.setHours(0, 0, 0, 0);
  return date < cutoff;
}

export function formatCadence(cadence) {
  const { unit, interval } = cadence;
  if (unit === 'week') {
    if (interval === 1) return 'Weekly';
    return `Every ${interval} weeks`;
  }
  if (interval === 1) return 'Monthly';
  return `Every ${interval} months`;
}

export function getChorePeriod(cadence, anchorStr, date = new Date()) {
  const anchor = parseDate(anchorStr);
  anchor.setHours(0, 0, 0, 0);

  if (cadence.unit === 'week') {
    const weekStart = getWeekStart(date);
    const anchorWeek = getWeekStart(anchor);
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weekDiff = Math.round((weekStart - anchorWeek) / msPerWeek);
    const active = weekDiff >= 0 && weekDiff % cadence.interval === 0;
    const key = toDateStr(weekStart);

    let nextDate = weekStart;
    if (!active) {
      for (let w = 1; w <= 52; w++) {
        const candidate = addDays(weekStart, w * 7);
        const wd = Math.round((getWeekStart(candidate) - anchorWeek) / msPerWeek);
        if (wd >= 0 && wd % cadence.interval === 0) {
          nextDate = getWeekStart(candidate);
          break;
        }
      }
    }

    return { active, key, nextDate };
  }

  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthDiff =
    (monthStart.getFullYear() - anchor.getFullYear()) * 12 +
    (monthStart.getMonth() - anchor.getMonth());
  const active = monthDiff >= 0 && monthDiff % cadence.interval === 0;
  const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

  let nextDate = monthStart;
  if (!active) {
    let cursor = addMonths(monthStart, 1);
    for (let i = 0; i < 24; i++) {
      const md =
        (cursor.getFullYear() - anchor.getFullYear()) * 12 +
        (cursor.getMonth() - anchor.getMonth());
      if (md >= 0 && md % cadence.interval === 0) {
        nextDate = cursor;
        break;
      }
      cursor = addMonths(cursor, 1);
    }
  }

  return { active, key, nextDate };
}
