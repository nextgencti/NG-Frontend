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

  // Initialize Firebase and load user from localStorage
  useEffect(() => {
    const initialize = async () => {
      try {
        const { auth } = await initFirebase();
        setAuthInstance(auth);

        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
          setCurrentUser(JSON.parse(storedUser));
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
      if (!authInstance) throw new Error("Firebase not initialized");
      const result = await signInWithPopup(authInstance, googleProvider);
      const idToken = await result.user.getIdToken();
      
      const response = await api.post('/auth/google-login', { idToken });
      
      const { user, token, isNewUser } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      
      return { user, isNew: isNewUser || !user.profileComplete };
    } catch (error) {
      console.error("Google login error:", error);
      toast.error('Failed to login with Google.');
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
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
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
