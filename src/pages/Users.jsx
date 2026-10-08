import { useEffect, useState, useCallback } from 'react';
import {
  Users as UsersIcon,
  Check,
  X,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { token, user: currentUser } = useAuth();

  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Get active token from state or localStorage
  const getAuthToken = useCallback(() => {
    if (token) return token;
    try {
      const stored = localStorage.getItem('dairychain_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.token;
      }
    } catch {
      // ignore storage errors
    }
    return null;
  }, [token]);

  const fetchData = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) {
      setPermissionDenied(true);
      setLoadingRequests(false);
      setLoadingUsers(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };

    // 1. Fetch access requests
    setLoadingRequests(true);
    try {
      const res = await fetch('http://localhost:5000/api/access-requests', { headers });
      if (res.status === 403) {
        setPermissionDenied(true);
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoadingRequests(false);
    }

    // 2. Fetch users
    setLoadingUsers(true);
    try {
      const res = await fetch('http://localhost:5000/api/users', { headers });
      if (res.status === 403) {
        setPermissionDenied(true);
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id) => {
    setActionLoadingId(id);
    setErrorBanner('');
    try {
      const res = await fetch(`http://localhost:5000/api/access-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessBanner('User approved. They can now log in with the password they set.');
        fetchData();
        setTimeout(() => setSuccessBanner(''), 7000);
      } else {
        setErrorBanner(data.error || 'Failed to approve request');
      }
    } catch (err) {
      setErrorBanner('Network error while approving request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoadingId(id);
    setErrorBanner('');
    try {
      const res = await fetch(`http://localhost:5000/api/access-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        fetchData();
      } else {
        setErrorBanner(data.error || 'Failed to reject request');
      }
    } catch (err) {
      setErrorBanner('Network error while rejecting request');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (permissionDenied) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12">
        <div className="bg-red-50 border border-danger/20 rounded-xl p-6 text-center text-danger max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-danger" />
          <h2 className="text-lg font-semibold">Access Restricted</h2>
          <p className="text-sm mt-1">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary flex items-center gap-2.5">
          <UsersIcon className="w-7 h-7 text-navy" />
          User Management
        </h1>
        <p className="text-sm text-ink-secondary mt-1">
          Manage access requests and existing user accounts
        </p>
      </div>

      {/* Notifications */}
      {successBanner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 rounded-xl flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <span className="font-medium">{successBanner}</span>
        </div>
      )}

      {errorBanner && (
        <div className="bg-red-50 border border-danger/20 text-danger text-sm p-4 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorBanner}</span>
        </div>
      )}

      {/* Section 1 — Pending Access Requests */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-ink-primary">
              Pending Access Requests
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber/15 text-amber border border-amber/25">
              {pendingRequests.length}
            </span>
          </div>
          <span className="text-xs text-ink-muted">
            Submitted via public request form
          </span>
        </div>

        <div className="mt-4">
          {loadingRequests ? (
            <div className="py-12 flex items-center justify-center text-ink-muted gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy" />
              <span className="text-sm">Loading access requests...</span>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-12 text-center text-ink-muted text-sm">
              No pending requests
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const isOperating = actionLoadingId === req._id;
                return (
                  <div
                    key={req._id}
                    className="rounded-lg border border-border p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-border-medium transition-colors"
                  >
                    {/* Left side */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-ink-primary">
                          {req.name}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber/10 text-amber border border-amber/25">
                          {req.requestedRole}
                        </span>
                      </div>

                      <p className="text-sm text-ink-secondary">{req.email}</p>

                      {req.reason && (
                        <p className="text-sm text-ink-secondary italic mt-2 bg-page/70 p-2.5 rounded-lg border border-border/50">
                          "{req.reason}"
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          Requested on {new Date(req.createdAt).toLocaleDateString()} at{' '}
                          {new Date(req.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => handleApprove(req._id)}
                        className="bg-navy hover:bg-navy-deep text-white text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
                      >
                        {isOperating ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Approve
                      </button>

                      <button
                        type="button"
                        disabled={isOperating}
                        onClick={() => handleReject(req._id)}
                        className="border border-danger/40 text-danger hover:bg-danger/10 text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 2 — All Users */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-semibold text-ink-primary">All Users</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-navy/10 text-navy border border-navy/20">
              {users.length}
            </span>
          </div>
          <span className="text-xs text-ink-muted">
            All registered system participants
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          {loadingUsers ? (
            <div className="py-12 flex items-center justify-center text-ink-muted gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-navy" />
              <span className="text-sm">Loading users list...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-ink-muted text-sm">
              No users registered
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const roleClasses =
                    u.role === 'admin'
                      ? 'bg-navy/10 text-navy border-navy/20'
                      : u.role === 'transport'
                        ? 'bg-amber/10 text-amber border-amber/20'
                        : 'bg-mint/10 text-mint border-mint/20';

                  return (
                    <tr key={u._id} className="hover:bg-page/50 transition-colors">
                      {/* User Cell */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                          {u.initials || 'DC'}
                        </div>
                        <span className="font-semibold text-ink-primary">
                          {u.name}
                        </span>
                      </td>

                      {/* Email Cell */}
                      <td className="py-3.5 px-4 text-ink-secondary font-mono text-xs">
                        {u.email}
                      </td>

                      {/* Role Cell */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleClasses}`}
                        >
                          {u.role === 'admin' && '👑 '}
                          {u.role === 'transport' && '🚚 '}
                          {u.role === 'inspector' && '🔍 '}
                          {u.role}
                        </span>
                      </td>

                      {/* Created Cell */}
                      <td className="py-3.5 px-4 text-xs text-ink-muted">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
