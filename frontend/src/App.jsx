import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import CaretakerDashboard from './pages/CaretakerDashboard.jsx';
import LandlordDashboard from './pages/LandlordDashboard.jsx';
import AuditTrailPage from './pages/AuditTrailPage.jsx';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route path="/student"   element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/caretaker" element={<ProtectedRoute><CaretakerDashboard /></ProtectedRoute>} />
        <Route path="/landlord"  element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/landlord/audit-trail" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
