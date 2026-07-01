import { isOlderThan } from './dates';

const RETENTION_DAYS = 30;

export function cleanupOldData() {
  cleanupByDateKeys('todos', RETENTION_DAYS);
  cleanupByDateKeys('todoOrder', RETENTION_DAYS);
  cleanupByDateKeys('recurringDone', RETENTION_DAYS);
  cleanupByDateKeys('mealPlans', RETENTION_DAYS);
  cleanupByDateKeys('groceryOverrides', RETENTION_DAYS);
  cleanupByDateKeys('calendarEvents', RETENTION_DAYS);
  cleanupChoreDone(RETENTION_DAYS);
}

const isDateKey = (k) => /^\d{4}-\d{2}-\d{2}$/.test(k);

function isPeriodKeyOld(key, days) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return isOlderThan(key, days);
  if (/^\d{4}-\d{2}$/.test(key)) {
    const [y, m] = key.split('-').map(Number);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);
    return new Date(y, m - 1, 1) < cutoff;
  }
  return false;
}

function cleanupChoreDone(days) {
  try {
    const raw = localStorage.getItem('choreDone');
    if (!raw) return;
    const data = JSON.parse(raw);
    const cleaned = {};
    for (const [setId, periods] of Object.entries(data)) {
      const kept = {};
      for (const [periodKey, value] of Object.entries(periods)) {
        if (!isPeriodKeyOld(periodKey, days)) kept[periodKey] = value;
      }
      if (Object.keys(kept).length > 0) cleaned[setId] = kept;
    }
    localStorage.setItem('choreDone', JSON.stringify(cleaned));
  } catch {
    // corrupted data, ignore
  }
}

function cleanupByDateKeys(storageKey, days) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    const cleaned = {};
    for (const [dateStr, value] of Object.entries(data)) {
      if (!isDateKey(dateStr) || !isOlderThan(dateStr, days)) cleaned[dateStr] = value;
    }
    localStorage.setItem(storageKey, JSON.stringify(cleaned));
  } catch {
    // corrupted data, ignore
  }
}
