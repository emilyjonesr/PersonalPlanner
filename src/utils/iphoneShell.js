/**
 * iPhone 15 Pro / standalone PWA shell.
 * Pins #root to the visual viewport and removes any leftover gap under the nav.
 */
export function initIphoneShell() {
  const root = document.getElementById('root');
  if (!root) return;

  const sync = () => {
    const vv = window.visualViewport;
    const top = vv ? vv.offsetTop : 0;
    const height = vv ? vv.height : window.innerHeight;

    root.style.position = 'fixed';
    root.style.left = '0';
    root.style.right = '0';
    root.style.width = '100%';
    root.style.top = `${top}px`;
    root.style.height = `${Math.round(height)}px`;
    root.style.bottom = 'auto';

    requestAnimationFrame(() => {
      const nav = document.querySelector('[data-bottom-nav]');
      if (!nav) return;

      // Kill any gap between the nav's bottom edge and the visible screen bottom
      const screenBottom = top + height;
      const navBottom = nav.getBoundingClientRect().bottom;
      const gap = screenBottom - navBottom;
      if (gap > 1) {
        root.style.height = `${Math.round(height + gap)}px`;
      }

      // If WebKit applied safe-area padding somehow, zero it — we intentionally
      // don't reserve a dead strip under the tabs on this device.
      if (parseFloat(getComputedStyle(nav).paddingBottom) > 0) {
        nav.style.paddingBottom = '0px';
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
  setTimeout(sync, 100);
  setTimeout(sync, 500);
}
