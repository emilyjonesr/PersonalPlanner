const THEME_KEY = 'theme';

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export function getResolvedTheme() {
  const stored = getStoredTheme();
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') {
    root.dataset.theme = theme;
  } else {
    delete root.dataset.theme;
  }

  const resolved = theme === 'light' || theme === 'dark'
    ? theme
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? '#121212' : '#e91e8c');
}

export function setTheme(theme) {
  try {
    if (theme === 'light' || theme === 'dark') {
      localStorage.setItem(THEME_KEY, theme);
    } else {
      localStorage.removeItem(THEME_KEY);
    }
  } catch {
    // ignore quota / private mode
  }
  applyTheme(theme);
}

export function toggleTheme() {
  const next = getResolvedTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/** Call once at startup before React renders. */
export function initTheme() {
  applyTheme(getStoredTheme());

  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = () => {
    if (!getStoredTheme()) applyTheme(null);
  };
  mq.addEventListener?.('change', onChange);
}
