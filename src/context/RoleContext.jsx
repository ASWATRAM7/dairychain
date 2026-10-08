import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Role-Based Access Control (RBAC) context for DairyChain.
 *
 * Stores the current user role in React state and persists it to
 * localStorage so it survives page refreshes. The admin role has
 * implicit access to everything.
 *
 * Roles:
 *   "admin"      → Administrator (full access)
 *   "transport"  → Transport / Operator
 *   "inspector"  → Inspector / Verifier
 */

const STORAGE_KEY = 'dairychain-role';

const RoleContext = createContext(null);

/**
 * Reads the persisted role from localStorage.
 * Returns null if nothing is stored or the value is invalid.
 */
const getPersistedRole = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['admin', 'transport', 'inspector'].includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
  }
  return null;
};

/**
 * Provider component that wraps the app and supplies RBAC context.
 *
 * @example
 * <RoleProvider>
 *   <App />
 * </RoleProvider>
 */
export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(getPersistedRole);

  /**
   * Set the active role and persist it.
   * @param {'admin' | 'transport' | 'inspector'} newRole
   */
  const setRole = useCallback((newRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem(STORAGE_KEY, newRole);
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  /**
   * Clear the active role.
   */
  const clearRole = useCallback(() => {
    setRoleState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently ignore storage errors
    }
  }, []);

  /**
   * Check if the current role has access to a resource.
   * Admin always has access. Returns false if no role is set.
   *
   * @param {string[]} requiredRoles — Array of role keys that are allowed
   * @returns {boolean}
   */
  const hasAccess = useCallback(
    (requiredRoles) => {
      if (!role) return false;
      if (role === 'admin') return true;
      return Array.isArray(requiredRoles) && requiredRoles.includes(role);
    },
    [role]
  );

  return (
    <RoleContext.Provider value={{ role, setRole, clearRole, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access the RBAC context.
 *
 * @returns {{
 *   role: 'admin' | 'transport' | 'inspector' | null,
 *   setRole: (role: string) => void,
 *   clearRole: () => void,
 *   hasAccess: (requiredRoles: string[]) => boolean
 * }}
 */
export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole() must be used within a <RoleProvider>');
  }
  return context;
}
