import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { cleanupOldData } from './utils/cleanup';
import './index.css';

navigator.storage?.persist?.();
cleanupOldData();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/PersonalPlanner/">
      <App />
    </BrowserRouter>
  </StrictMode>,
);
