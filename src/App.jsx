import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import CompleteProfile from './pages/CompleteProfile';
import PendingApproval from './pages/student/PendingApproval';

// Public Pages
import Home from './pages/public/Home';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';

// Student Pages
import StudentOverview from './pages/student/Overview';
import MyCourses from './pages/student/MyCourses';
import Tests from './pages/student/Tests';
import TakeTest from './pages/student/TakeTest';
import Attendance from './pages/student/Attendance';
import Fees from './pages/student/Fees';
import Certificates from './pages/student/Certificates';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminFinance from './pages/admin/AdminFinance';
import AdminTests from './pages/admin/AdminTests';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#334155', color: '#fff' } }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* Student Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<StudentOverview />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="tests" element={<Tests />} />
              <Route path="tests/:testId/take" element={<TakeTest />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="certificates" element={<Certificates />} />
            </Route>

            {/* Admin Dashboard Routes (Adding role verification logic later) */}
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin" />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="tests" element={<AdminTests />} />
              </Route>
            </Route>

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
