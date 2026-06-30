import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

// Firebase client config (these are public/safe keys by design)
const firebaseConfig = {
  apiKey: "AIzaSyBOXGrKq7dq68_4oI3Xl3i0iWm95ZNyIOs",
  authDomain: "f-nextgen.firebaseapp.com",
  projectId: "f-nextgen",
  storageBucket: "f-nextgen.firebasestorage.app",
  messagingSenderId: "459484293290",
  appId: "1:459484293290:web:81904f1ccc9edf1b41c8d3"
};

// Initialize Firebase immediately (no async wait needed)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Keep initFirebase for backward compatibility with AuthContext
export const initFirebase = async () => {
  return { auth, googleProvider };
};

export { auth, googleProvider, signInWithPopup, signOut, signInWithEmailAndPassword, sendPasswordResetEmail };
