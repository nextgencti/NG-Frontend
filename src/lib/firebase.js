import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import api from './axios';

let auth;
let googleProvider;

/**
 * Initializes Firebase by fetching config from the backend.
 * This ensures we don't need to hardcode VITE_FIREBASE_* variables in the frontend .env
 */
export const initFirebase = async () => {
  if (auth) return { auth, googleProvider };

  try {
    const { data: config } = await api.get('/config/firebase');
    
    // Initialize Firebase
    const app = initializeApp(config);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    console.log('[FIREBASE] Initialized with config from backend');
    return { auth, googleProvider };
  } catch (error) {
    console.error('[FIREBASE] Initialization failed:', error);
    // Fallback to placeholder or environment variables if fetch fails
    const fallbackConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    const app = initializeApp(fallbackConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    return { auth, googleProvider };
  }
};

// Exporting a lazy-initialized auth proxy or similar might be complex, 
// so we'll export the init function and let the App.jsx or main.jsx handle it.
export { auth, googleProvider, signInWithPopup, signOut };
