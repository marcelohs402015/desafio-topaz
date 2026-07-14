import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ShortenerPage } from './pages/ShortenerPage';
import { UrlListPage } from './pages/UrlListPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/shorten" element={<ShortenerPage />} />
            <Route path="/urls" element={<UrlListPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/shorten" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
