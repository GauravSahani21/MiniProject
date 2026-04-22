import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage      from './pages/LandingPage';
import LoginPage        from './pages/LoginPage';
import ParentDashboard  from './pages/ParentDashboard';
import AddChildPage     from './pages/AddChildPage';
import ChildDetailPage  from './pages/ChildDetailPage';
import ScreeningPage    from './pages/ScreeningPage';
import ResultPage       from './pages/ResultPage';
import HistoryPage      from './pages/HistoryPage';
import DoctorDashboard  from './pages/DoctorDashboard';
import PatientDetailPage from './pages/PatientDetailPage';
import AwarenessPage    from './pages/AwarenessPage';
import AdminPanel       from './pages/AdminPanel';
import NotFoundPage     from './pages/NotFoundPage';

import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';

/* ── Protected Route ─────────────────────────────── */
function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    const dash = user.role === 'doctor' ? '/doctor' : user.role === 'admin' ? '/admin' : '/parent';
    return <Navigate to={dash} replace />;
  }
  return children;
}

/* ── App Layout ──────────────────────────────────── */
function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/awareness" element={<AwarenessPage />} />
        <Route path="*"          element={<NotFoundPage />} />

        {/* Parent */}
        <Route path="/parent"           element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/add-child"        element={<ProtectedRoute roles={['parent']}><AddChildPage /></ProtectedRoute>} />
        <Route path="/child/:id"        element={<ProtectedRoute roles={['parent']}><ChildDetailPage /></ProtectedRoute>} />
        <Route path="/screening"        element={<ProtectedRoute roles={['parent']}><ScreeningPage /></ProtectedRoute>} />
        <Route path="/screening/:childId" element={<ProtectedRoute roles={['parent']}><ScreeningPage /></ProtectedRoute>} />
        <Route path="/result"           element={<ProtectedRoute roles={['parent']}><ResultPage /></ProtectedRoute>} />
        <Route path="/history"          element={<ProtectedRoute roles={['parent']}><HistoryPage /></ProtectedRoute>} />

        {/* Doctor */}
        <Route path="/doctor"                element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/doctor/patient/:id"    element={<ProtectedRoute roles={['doctor']}><PatientDetailPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>} />
      </Routes>
      <Chatbot />
    </>
  );
}

/* ── Root ────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
