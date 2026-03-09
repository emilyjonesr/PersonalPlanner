import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HabitsPage from './pages/HabitsPage';
import TodosPage from './pages/TodosPage';
import MealsPage from './pages/MealsPage';

export default function App() {
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
