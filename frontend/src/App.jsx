import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Survey from './pages/Survey';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ImportExport from './pages/admin/ImportExport';
import Respondents from './pages/admin/Respondents';

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Cargando...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return children;
}

function SurveyOnlyForUsers({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SurveyOnlyForUsers>
              <Survey />
            </SurveyOnlyForUsers>
          </ProtectedRoute>
        }
      />
      <Route
        path="/encuesta"
        element={
          <ProtectedRoute>
            <Survey />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="respondents" element={<Respondents />} />
        <Route path="import-export" element={<ImportExport />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
