import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import StudentSignup from './pages/public/StudentSignup';
import InstituteSignup from './pages/public/InstituteSignup';


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
import StudentClassroom from './pages/student/StudentClassroom';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminStudents from './pages/admin/AdminStudents';
import AdminCourses from './pages/admin/AdminCourses';
import AdminCourseContent from './pages/admin/AdminCourseContent';
import AdminFinance from './pages/admin/AdminFinance';
import AdminTests from './pages/admin/AdminTests';
import AdminTestResults from './pages/admin/AdminTestResults';
import AdminEditTest from './pages/admin/AdminEditTest';
import AdminPin from './pages/admin/AdminPin';
import AdminSettings from './pages/admin/AdminSettings';

// Super Admin Pages
import SuperAdminOverview from './pages/superadmin/SuperAdminOverview';
import SuperAdminInstitutes from './pages/superadmin/SuperAdminInstitutes';
import SuperAdminAdmins from './pages/superadmin/SuperAdminAdmins';
import SuperAdminRequests from './pages/superadmin/SuperAdminRequests';
import SuperAdminPin from './pages/superadmin/SuperAdminPin';


import { useAuth } from './context/AuthContext';

const SAVerifiedRoute = () => {
  const { isSuperAdminVerified } = useAuth();
  
  if (!isSuperAdminVerified) {
    return <Navigate to="/sa-pin" replace />;
  }
  return <Outlet />;
};

const AdminVerifiedRoute = () => {
  const { isAdminVerified, currentUser } = useAuth();
  
  // If Super Admin accesses /admin, bypass Admin PIN since they already did SA PIN
  if (currentUser?.role === 'superadmin' && localStorage.getItem('sa_verified') === 'true') {
     return <Outlet />;
  }

  if (!isAdminVerified) {
    return <Navigate to="/admin-pin" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#334155', color: '#fff' } }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<StudentSignup />} />
          <Route path="/register-institute" element={<InstituteSignup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/complete-profile" element={<CompleteProfile />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            
            {/* Student Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<StudentOverview />} />
              <Route path="courses" element={<MyCourses />} />
              <Route path="courses/:courseId/classroom" element={<StudentClassroom />} />
              <Route path="tests" element={<Tests />} />
              <Route path="tests/:testId/take" element={<TakeTest />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="fees" element={<Fees />} />
              <Route path="certificates" element={<Certificates />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="/admin-pin" element={<AdminPin />} />
            
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={['admin', 'superadmin']}>
                <AdminVerifiedRoute />
              </ProtectedRoute>
            }>
              <Route element={<DashboardLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="courses/:courseId/content" element={<AdminCourseContent />} />
                <Route path="finance" element={<AdminFinance />} />
                <Route path="tests" element={<AdminTests />} />
                <Route path="tests/:testId/results" element={<AdminTestResults />} />
                <Route path="tests/:testId/edit" element={<AdminEditTest />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Route>

            {/* Super Admin Dashboard Routes */}
            <Route path="/sa-pin" element={<SuperAdminPin />} />
            
            <Route path="/superadmin" element={
              <ProtectedRoute requiredRole="superadmin">
                <SAVerifiedRoute />
              </ProtectedRoute>
            }>
              <Route element={<DashboardLayout />}>
                <Route index element={<SuperAdminOverview />} />
                <Route path="institutes" element={<SuperAdminInstitutes />} />
                <Route path="admins" element={<SuperAdminAdmins />} />
                <Route path="requests" element={<SuperAdminRequests />} />
              </Route>

            </Route>

          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
