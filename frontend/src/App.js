import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import LandlordDashboard from './pages/LandlordDashboard';
import './App.css';

function ProtectedRoute({ children }) {
  try {
    const token = localStorage?.getItem?.('access_token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }
    return children ?? null;
  } catch (err) {
    console.error('[ProtectedRoute] Error checking token:', err);
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/student" 
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <StudentDashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/caretaker" 
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <CaretakerDashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            } 
          />
          <Route 
            path="/landlord" 
            element={
              <ErrorBoundary>
                <ProtectedRoute>
                  <LandlordDashboard />
                </ProtectedRoute>
              </ErrorBoundary>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
