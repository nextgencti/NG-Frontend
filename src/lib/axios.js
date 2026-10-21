import axios from 'axios';
import { auth } from './firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ng-backend-91oz.onrender.com/api',
});

// Request interceptor: always inject fresh auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper: Safely wait for Firebase Auth to initialize from IndexedDB (up to 3 seconds)
const getFirebaseUser = async () => {
  if (auth.currentUser) return auth.currentUser;
  if (typeof auth.authStateReady === 'function') {
    try {
      await Promise.race([
        auth.authStateReady(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 3000))
      ]);
      return auth.currentUser;
    } catch {
      return null;
    }
  }
  return null;
};

// Queue handling for multiple parallel API requests that encounter expired tokens simultaneously
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle complete session expiration when even silent refresh is impossible
const handleSessionExpired = () => {
  const token = localStorage.getItem('token');
  if (token) {
    console.warn('[AUTH] Session is expired and cannot be refreshed. Clearing local state.');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('student_dashboard_data');
    localStorage.removeItem('sa_verified');
    localStorage.removeItem('admin_verified');

    // Notify React AuthContext
    window.dispatchEvent(new CustomEvent('auth:session_expired'));

    // If currently on a dashboard route, redirect cleanly to login
    const pathname = window.location.pathname;
    if (pathname.includes('/dashboard') || pathname.includes('/admin') || pathname.includes('/superadmin')) {
      window.location.href = '/login?expired=true';
    }
  }
};

// Response interceptor: automatically renew expired JWT tokens & retry failed requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const isAuthError = (status === 401 || status === 403);
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');

    // Only attempt refresh for protected application endpoints, not login/refresh themselves
    if (isAuthError && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another request is already refreshing the token; wait for it
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const fbUser = await getFirebaseUser();

        if (fbUser) {
          // Force a fresh Firebase ID token
          const freshIdToken = await fbUser.getIdToken(true);

          // Exchange fresh Firebase ID token for a fresh 30-day Backend JWT
          const refreshRes = await axios.post(
            `${api.defaults.baseURL}/auth/refresh-token`,
            { idToken: freshIdToken }
          );

          if (refreshRes.data.success && refreshRes.data.token) {
            const newToken = refreshRes.data.token;
            localStorage.setItem('token', newToken);

            if (refreshRes.data.user) {
              localStorage.setItem('user', JSON.stringify(refreshRes.data.user));
            }

            console.log('[AUTH] Silent token refresh successful! Retrying original request.');

            // Update default headers and retry the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return api(originalRequest);
          }
        }

        // No active Firebase user or refresh endpoint failed
        processQueue(error, null);
        handleSessionExpired();
        return Promise.reject(error);
      } catch (refreshErr) {
        console.error('[AUTH] Silent refresh attempt failed:', refreshErr.message);
        processQueue(refreshErr, null);
        handleSessionExpired();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
