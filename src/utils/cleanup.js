import { isOlderThan } from './dates';

const RETENTION_DAYS = 30;

export function cleanupOldData() {
  cleanupByDateKeys('todos', RETENTION_DAYS);
  cleanupByDateKeys('recurringDone', RETENTION_DAYS);
  cleanupByDateKeys('mealPlans', RETENTION_DAYS);
  cleanupByDateKeys('groceryOverrides', RETENTION_DAYS);
  cleanupByDateKeys('calendarEvents', RETENTION_DAYS);
}

function cleanupByDateKeys(storageKey, days) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const data = JSON.parse(raw);
    const cleaned = {};
    for (const [dateStr, value] of Object.entries(data)) {
      if (!isOlderThan(dateStr, days)) cleaned[dateStr] = value;
    }
    localStorage.setItem(storageKey, JSON.stringify(cleaned));
  } catch {
    // corrupted data, ignore
  }
}
