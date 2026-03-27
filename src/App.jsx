import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HabitsPage from './pages/HabitsPage';
import TodosPage from './pages/TodosPage';
import MealsPage from './pages/MealsPage';
import { cleanupOldData } from './utils/cleanup';
import { today } from './utils/dates';

export default function App() {
  useEffect(() => {
    const LAST_CLEANUP_KEY = 'lastCleanup';
    const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);
    const todayStr = today();
    if (lastCleanup === todayStr) return;
    cleanupOldData();
    localStorage.setItem(LAST_CLEANUP_KEY, todayStr);
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/habits" replace />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/meals" element={<MealsPage />} />
      </Route>
    </Routes>
  );
}
