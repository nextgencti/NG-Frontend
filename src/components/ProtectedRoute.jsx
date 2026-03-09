import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ requiredRole = null }) {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const { pathname } = useLocation();

  // Enforce pending account approval block
  if (currentUser?.role === 'student' && currentUser?.status === 'pending') {
    // Only allow them to complete profile or see the pending screen
    if (pathname !== '/complete-profile' && pathname !== '/pending-approval') {
      return <Navigate to="/pending-approval" replace />;
    }
  }

  // Prevent active students from seeing pending screen
  if (currentUser?.role === 'student' && currentUser?.status !== 'pending') {
    if (pathname === '/pending-approval') {
       return <Navigate to="/dashboard" replace />;
    }
  }

  if (requiredRole && currentUser?.role !== requiredRole) {
    // If user is not the required role (e.g., student trying to access admin)
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
