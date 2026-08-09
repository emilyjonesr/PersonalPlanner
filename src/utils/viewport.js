/** Keep --app-height locked to the window height (fixes iOS PWA bottom gap on open). */
export function initViewportHeight() {
  const set = () => {
    // Prefer innerHeight over visualViewport so the keyboard doesn't shrink the app chrome.
    const h = window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${Math.round(h)}px`);
  };

  set();
  window.addEventListener('resize', set);
  window.addEventListener('orientationchange', () => {
    setTimeout(set, 100);
    setTimeout(set, 400);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(set, 50);
      setTimeout(set, 300);
    }
  });
  window.addEventListener('pageshow', set);
  // iOS often reports a stale height on the first tick after launch
  requestAnimationFrame(set);
  setTimeout(set, 100);
  setTimeout(set, 500);
}
