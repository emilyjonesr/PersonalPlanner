/**
 * iPhone 15 Pro / standalone PWA shell.
 * Fill the real screen edge-to-edge so no grey (--color-bg) strip shows under the nav.
 */
export function initIphoneShell() {
  const root = document.getElementById('root');
  if (!root) return;

  const sync = () => {
    // Prefer the largest credible height — visualViewport alone is often short
    // on iPhone and leaves a grey strip under the tab bar.
    const vv = window.visualViewport;
    const height = Math.max(
      window.innerHeight || 0,
      document.documentElement.clientHeight || 0,
      vv ? Math.round(vv.height + vv.offsetTop) : 0,
    );

    root.style.position = 'fixed';
    root.style.left = '0';
    root.style.right = '0';
    root.style.top = '0';
    root.style.bottom = '0';
    root.style.width = '100%';
    root.style.height = `${height}px`;
    root.style.minHeight = '100%';
    root.style.maxHeight = 'none';

    requestAnimationFrame(() => {
      const nav = document.querySelector('[data-bottom-nav]');
      if (!nav) return;

      nav.style.paddingBottom = '0px';

      // If anything still peeks below the nav, grow the root to cover it
      const gap = window.innerHeight - nav.getBoundingClientRect().bottom;
      if (gap > 0.5) {
        const current = root.getBoundingClientRect().height;
        root.style.height = `${Math.ceil(current + gap)}px`;
      }
    });
  };

  sync();
  window.visualViewport?.addEventListener('resize', sync);
  window.visualViewport?.addEventListener('scroll', sync);
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', () => {
    setTimeout(sync, 100);
    setTimeout(sync, 400);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(sync, 50);
      setTimeout(sync, 300);
    }
  });
  setTimeout(sync, 50);
  setTimeout(sync, 200);
  setTimeout(sync, 600);
}
