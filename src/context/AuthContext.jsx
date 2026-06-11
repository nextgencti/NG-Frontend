import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initFirebase, signInWithPopup, signOut } from '../lib/firebase';
import toast from 'react-hot-toast';
import api from '../lib/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInstance, setAuthInstance] = useState(null);
  const [providerInstance, setProviderInstance] = useState(null);
  const [isSuperAdminVerified, setIsSuperAdminVerified] = useState(false);
  const [isAdminVerified, setIsAdminVerified] = useState(false);

  // Keep a ref to track Firebase init promise so we can await it in loginWithGoogle
  const firebaseInitPromise = useRef(null);

  useEffect(() => {
    // ── PHASE 1: Instant localStorage read (< 10ms) ──
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const saVerified = localStorage.getItem('sa_verified');
      const adminVerified = localStorage.getItem('admin_verified');

      if (storedUser && token) {
        setCurrentUser(JSON.parse(storedUser));
      }
      if (saVerified === 'true') {
        setIsSuperAdminVerified(true);
      }
      if (adminVerified === 'true') {
        setIsAdminVerified(true);
      }
    } catch (error) {
      console.error("localStorage read error:", error);
    }
    // App renders immediately after this
    setLoading(false);

    // ── PHASE 2: Firebase init in background (doesn't block UI) ──
    firebaseInitPromise.current = initFirebase()
      .then(({ auth, googleProvider: provider }) => {
        setAuthInstance(auth);
        setProviderInstance(provider);
        console.log('[AUTH] Firebase ready in background');
      })
      .catch((error) => {
        console.error("[AUTH] Background Firebase init error:", error);
      });
  }, []);

  // Login with Google — waits for Firebase only when user actually clicks login
  const loginWithGoogle = async () => {
    try {
      // If Firebase isn't ready yet, wait for it now (only blocks login, not page)
      if (!authInstance || !providerInstance) {
        console.log('[AUTH] Waiting for Firebase to initialize...');
        try {
          const { auth, googleProvider: provider } = await initFirebase();
          setAuthInstance(auth);
          setProviderInstance(provider);
        } catch (fbError) {
          console.error('[AUTH] Firebase init failed during login:', fbError);
          toast.error('Connection issue. Please try again.');
          throw fbError;
        }
      }

      const result = await signInWithPopup(authInstance, providerInstance);
      const idToken = await result.user.getIdToken();
      
      const response = await api.post('/auth/google-login', { idToken });
      
      const { user, token, isNewUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Reset verifications on fresh login
      localStorage.removeItem('sa_verified');
      setIsSuperAdminVerified(false);
      localStorage.removeItem('admin_verified');
      setIsAdminVerified(false);
      
      setCurrentUser(user);
      
      return { user, isNew: isNewUser || !user.profileComplete };
    } catch (error) {
      console.error("Google login error:", error);
      toast.error('Failed to login with Google.');
      throw error;
    }
  };

  const verifySuperAdminPin = async (pin) => {
    try {
      const response = await api.post('/superadmin/verify-pin', { pin });
      if (response.data.success) {
        setIsSuperAdminVerified(true);
        localStorage.setItem('sa_verified', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error("PIN Verification Failed:", error);
      return false;
    }
  };

  const verifyAdminPin = async (pin) => {
    try {
      const response = await api.post('/admin/verify-pin', { pin });
      if (response.data.success) {
        setIsAdminVerified(true);
        localStorage.setItem('admin_verified', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error("Admin PIN Verification Failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sa_verified');
      localStorage.removeItem('admin_verified');
      localStorage.removeItem('student_dashboard_data');
      localStorage.removeItem('admin_stats');
      localStorage.removeItem('superadmin_stats');
      setCurrentUser(null);
      setIsSuperAdminVerified(false);
      setIsAdminVerified(false);
      if (authInstance) {
        await signOut(authInstance); // Firebase signout
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    currentUser,
    setCurrentUser,
    loginWithGoogle,
    logout,
    loading,
    isAuthenticated: !!currentUser,
    isSuperAdminVerified,
    verifySuperAdminPin,
    isAdminVerified,
    verifyAdminPin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
