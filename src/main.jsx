import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initTheme } from './utils/theme';
import { initIphoneShell } from './utils/iphoneShell';
import './index.css';

initTheme();

navigator.storage?.persist?.();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/PersonalPlanner/">
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// After React mounts so [data-bottom-nav] exists for gap correction
requestAnimationFrame(() => initIphoneShell());
