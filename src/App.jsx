import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageSkeleton from './components/shared/PageSkeleton';
import HomeSkeleton from './components/shared/HomeSkeleton';

const RouteSuspense = ({ children }) => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.includes('/dashboard') || 
                           location.pathname.includes('/admin') || 
                           location.pathname.includes('/superadmin') ||
                           location.pathname.includes('/complete-profile') ||
                           location.pathname.includes('/pending-approval');

  return (
    <Suspense fallback={isDashboardRoute ? <PageSkeleton /> : <HomeSkeleton />}>
      {children}
    </Suspense>
  );
};

// Auth Pages (Lazy)
const Login = lazy(() => import('./pages/Login'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const CompleteProfile = lazy(() => import('./pages/CompleteProfile'));
const PendingApproval = lazy(() => import('./pages/student/PendingApproval'));

// Public Pages (Lazy)
const Home = lazy(() => import('./pages/public/Home'));
const StudentSignup = lazy(() => import('./pages/public/StudentSignup'));
const InstituteSignup = lazy(() => import('./pages/public/InstituteSignup'));
const PublicTestRunner = lazy(() => import('./pages/public/PublicTestRunner'));
const About = lazy(() => import('./pages/public/About'));
const Services = lazy(() => import('./pages/public/Services'));
const Tools = lazy(() => import('./pages/public/Tools'));
const TypingTest = lazy(() => import('./pages/public/TypingTest'));
const AgeCalculator = lazy(() => import('./pages/public/AgeCalculator'));
const PercentageCalculator = lazy(() => import('./pages/public/PercentageCalculator'));
const WordCounter = lazy(() => import('./pages/public/WordCounter'));

// Layouts (Lazy)
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));

// Student Pages (Lazy)
const StudentOverview = lazy(() => import('./pages/student/Overview'));
const MyCourses = lazy(() => import('./pages/student/MyCourses'));
const Tests = lazy(() => import('./pages/student/Tests'));
const TakeTest = lazy(() => import('./pages/student/TakeTest'));
const Activity = lazy(() => import('./pages/student/Activity'));
const Fees = lazy(() => import('./pages/student/Fees'));
const Certificates = lazy(() => import('./pages/student/Certificates'));
const StudentClassroom = lazy(() => import('./pages/student/StudentClassroom'));

// Admin Pages (Lazy)
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminStudents = lazy(() => import('./pages/admin/AdminStudents'));
const AdminCourses = lazy(() => import('./pages/admin/AdminCourses'));
const AdminCourseContent = lazy(() => import('./pages/admin/AdminCourseContent'));
const AdminFinance = lazy(() => import('./pages/admin/AdminFinance'));
const AdminTests = lazy(() => import('./pages/admin/AdminTests'));
const AdminTestResults = lazy(() => import('./pages/admin/AdminTestResults'));
const AdminEditTest = lazy(() => import('./pages/admin/AdminEditTest'));
const AdminPin = lazy(() => import('./pages/admin/AdminPin'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

// Super Admin Pages (Lazy)
const SuperAdminOverview = lazy(() => import('./pages/superadmin/SuperAdminOverview'));
const SuperAdminInstitutes = lazy(() => import('./pages/superadmin/SuperAdminInstitutes'));
const SuperAdminAdmins = lazy(() => import('./pages/superadmin/SuperAdminAdmins'));
const PublicLeads = lazy(() => import('./pages/superadmin/PublicLeads'));
const SuperAdminPin = lazy(() => import('./pages/superadmin/SuperAdminPin'));
const SuperAdminControls = lazy(() => import('./pages/superadmin/SuperAdminControls'));

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
        <RouteSuspense>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<StudentSignup />} />
            <Route path="/register-institute" element={<InstituteSignup />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/tests/public/:testId" element={<PublicTestRunner />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="/tools/typing-test" element={<TypingTest />} />
            <Route path="/tools/age-calculator" element={<AgeCalculator />} />
            <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
            <Route path="/tools/word-counter" element={<WordCounter />} />

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
                <Route path="activity" element={<Activity />} />
                <Route path="attendance" element={<Navigate to="/dashboard/activity" replace />} />
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
                  <Route path="leads" element={<PublicLeads />} />
                  <Route path="controls" element={<SuperAdminControls />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </RouteSuspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
