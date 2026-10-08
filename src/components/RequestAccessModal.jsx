import { useState, useEffect } from 'react';
import { UserPlus, X, Loader2, Eye, EyeOff } from 'lucide-react';

export default function RequestAccessModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [requestedRole, setRequestedRole] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setRequestedRole('');
      setReason('');
      setError('');
      setSuccess('');
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getPasswordStrength = () => {
    const len = password.length;
    if (len === 0) return { score: 0, label: '', textClass: '', barClass: 'bg-border' };
    if (len < 6) return { score: 1, label: 'Weak', textClass: 'text-red-500', barClass: 'bg-red-500' };
    if (len <= 7) return { score: 2, label: 'Fair', textClass: 'text-amber-500', barClass: 'bg-amber-500' };
    if (len <= 9) return { score: 3, label: 'Good', textClass: 'text-yellow-500', barClass: 'bg-yellow-500' };
    return { score: 4, label: 'Strong', textClass: 'text-mint', barClass: 'bg-mint' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !email.trim() || !requestedRole) {
      setError('Please fill in your name, email, and requested role.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/access-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          requestedRole,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Your request has been submitted. An admin will review it shortly.');
        setName('');
        setEmail('');
        setPassword('');
        setRequestedRole('');
        setReason('');

        setTimeout(() => {
          onClose();
          setSuccess('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to submit request');
      }
    } catch (err) {
      console.error('Request access error:', err);
      setError('Network error. Unable to reach the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    'rounded-lg border border-border-medium px-4 py-2.5 w-full focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 text-sm bg-white text-ink-primary';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card max-w-md w-full rounded-xl shadow-2xl p-6 relative animate-fadeIn">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-navy shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-ink-primary">Request an Account</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-ink-secondary mt-2">
          Submit your details. An administrator will review and approve your access.
        </p>

        {/* Feedback alerts */}
        {error && (
          <div className="mt-4 bg-red-50 text-danger text-sm p-3 rounded-lg border border-danger/20">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-4 bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-200">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className={inputClasses}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@dairychain.in"
              className={inputClasses}
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={`${inputClasses} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-secondary p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicator */}
            <div className="mt-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      password.length === 0
                        ? 'bg-border'
                        : step <= strength.score
                          ? strength.barClass
                          : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              {password.length > 0 && (
                <p className={`text-xs font-medium mt-1 ${strength.textClass}`}>
                  {strength.label}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Requested Role
            </label>
            <select
              required
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              className={inputClasses}
            >
              <option value="">Select a role</option>
              <option value="transport">Transport / Operator</option>
              <option value="inspector">Inspector / Verifier</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain your operational assignment (e.g. Salem tanker fleet logistics)..."
              maxLength={500}
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || Boolean(success)}
            className="w-full bg-navy hover:bg-navy-deep text-white rounded-lg py-3 font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
