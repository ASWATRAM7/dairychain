// Use same-origin API calls by default so the frontend and backend can be
// deployed together. VITE_API_URL can point at a separate API in other setups.
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
