import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { initTheme } from './utils/theme';
import { initViewportHeight } from './utils/viewport';
import './index.css';

initTheme();
initViewportHeight();

navigator.storage?.persist?.();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/PersonalPlanner/">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
