/**
 * RBAC route access configuration for DairyChain.
 *
 * Maps each route path to the array of roles that may access it.
 * The admin role has implicit full access (handled by useRole().hasAccess),
 * but is listed here for documentation clarity.
 */

export const ROUTE_ACCESS = {
  '/':           ['admin', 'transport', 'inspector'],
  '/dashboard':  ['admin', 'transport', 'inspector'],
  '/batches':    ['admin', 'transport', 'inspector'],
  '/batch':      ['admin', 'transport', 'inspector'],
  '/violations': ['admin', 'transport', 'inspector'],
  '/verify':     ['admin', 'inspector'],
  '/scan':       ['admin', 'transport', 'inspector'],
  '/ledger':     ['admin', 'inspector'],
  '/about':      ['admin', 'transport', 'inspector'],
  '/users':      ['admin'],
  '/analytics':  ['admin'],
};

/**
 * Role display metadata.
 */
export const ROLES = {
  admin:     { label: 'Administrator',        icon: '👑', color: 'navy' },
  transport: { label: 'Transport / Operator', icon: '🚚', color: 'amber' },
  inspector: { label: 'Inspector / Verifier', icon: '🔍', color: 'mint' },
};
