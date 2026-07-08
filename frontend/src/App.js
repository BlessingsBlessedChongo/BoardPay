import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import LandlordDashboard from './pages/LandlordDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/caretaker" element={<CaretakerDashboard />} />
        <Route path="/landlord" element={<LandlordDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;