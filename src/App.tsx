import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/Home';
import { BookDetailPage } from './pages/BookDetail';
import { ProfilePage } from './pages/Profile';
import { ShareFormPage } from './pages/ShareForm';
import { AuthPage } from './pages/Auth';
import { NotFoundPage } from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

export const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="books/:id" element={<BookDetailPage />} />
      <Route
        path="profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="share/new"
        element={
          <ProtectedRoute>
            <ShareFormPage mode="create" />
          </ProtectedRoute>
        }
      />
      <Route
        path="share/:id/edit"
        element={
          <ProtectedRoute>
            <ShareFormPage mode="edit" />
          </ProtectedRoute>
        }
      />
      <Route path="auth" element={<AuthPage />} />
      <Route path="home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

