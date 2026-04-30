import React, { createContext, useContext, useState, useEffect } from 'react';
import { initFirebase, auth as firebaseAuth, googleProvider, signInWithPopup, signOut } from '../lib/firebase';
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

  // Initialize Firebase and load user from localStorage
  useEffect(() => {
    const initialize = async () => {
      try {
        const { auth, googleProvider: provider } = await initFirebase();
        setAuthInstance(auth);
        setProviderInstance(provider);

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
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      if (!authInstance || !providerInstance) throw new Error("Firebase not initialized fully");
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
      {!loading && children}
    </AuthContext.Provider>
  );
};
