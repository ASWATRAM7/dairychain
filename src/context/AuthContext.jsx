import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Authentication context for DairyChain.
 *
 * Connects to the backend auth API (http://localhost:5000/api/auth/login),
 * stores JWT token and user session, and persists them in localStorage.
 */

const STORAGE_KEY = 'dairychain_auth';
const API_URL = 'http://localhost:5000/api/auth';

const AuthContext = createContext(null);

/**
 * Reads persisted auth data (token and user) from localStorage.
 */
const getPersistedAuth = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.token && parsed.user) {
        return { token: parsed.token, user: parsed.user };
      }
    }
  } catch {
    // localStorage may be unavailable or corrupted
  }
  return { token: null, user: null };
};

/**
 * Provider component that wraps the app and supplies auth context.
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }) {
  const [authData, setAuthData] = useState(getPersistedAuth);
  const [user, setUser] = useState(authData.user);
  const [token, setToken] = useState(authData.token);

  const isAuthenticated = Boolean(user && token);

  /**
   * Attempt to log in with email and password via backend API.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, role?: string, error?: string }>}
   */
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const userData = {
          id: data.user.id || data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          initials: data.user.initials,
        };

        setUser(userData);
        setToken(data.token);

        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ token: data.token, user: userData })
          );
        } catch {
          // Silently ignore storage errors
        }

        return { success: true, role: userData.role };
      }

      return { success: false, error: data.error || 'Login failed' };
    } catch (err) {
      console.error('Login network error:', err);
      return { success: false, error: err.message || 'Network error connecting to auth server' };
    }
  }, []);

  /**
   * Log out the current user. Clears user, token, and localStorage.
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the auth context.
 *
 * @returns {{
 *   user: { id: string, email: string, name: string, role: string, initials: string } | null,
 *   token: string | null,
 *   isAuthenticated: boolean,
 *   login: (email: string, password: string) => Promise<{ success: boolean, role?: string, error?: string }>,
 *   logout: () => void
 * }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() must be used within an <AuthProvider>');
  }
  return context;
}
