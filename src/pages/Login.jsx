import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  Droplet,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RequestAccessModal from '../components/RequestAccessModal';

const DEMO_ACCOUNTS = [
  { email: 'admin@dairychain.in', password: 'admin123', label: 'Administrator' },
  { email: 'transport@dairychain.in', password: 'transport123', label: 'Transport' },
  { email: 'inspector@dairychain.in', password: 'inspector123', label: 'Inspector' },
];

const BG_IMAGE = 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setIsLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* ═══ LEFT PANEL — Hero image ═══ */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden">
        {/* Background image */}
        <img
          src={BG_IMAGE}
          alt="Dairy farm at golden hour"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-deep/85 via-navy-deep/70 to-navy/40" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between w-full p-10 lg:p-14">
          {/* Logo top-left */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 border border-white/25">
              <Droplet className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-[17px] tracking-tight text-white">
              Dairy<span className="text-amber">Chain</span>
            </span>
          </div>

          {/* Center content */}
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white/90 mb-6">
              🔗 Blockchain-Powered
            </span>
            <h1 className="font-serif text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-5">
              Every Drop,<br />Traceable.
            </h1>
            <p className="text-white/70 text-[15px] leading-relaxed max-w-sm">
              Sign in to access your role-based dashboard for Tamil Nadu's dairy
              supply chain network.
            </p>
          </div>

          {/* Bottom trust badges */}
          <div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-white/55 font-medium mb-4">
              <span>🔒 Blockchain Secured</span>
              <span className="text-white/25">|</span>
              <span>🌡️ 24/7 Monitoring</span>
              <span className="text-white/25">|</span>
              <span>✅ FSSAI Compliant</span>
            </div>
            <p className="text-[11px] text-white/35">
              © 2025 DairyChain Consortium
            </p>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Login form ═══ */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo (only on small screens) */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-navy shadow-lg">
              <Droplet className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
            </span>
            <span className="font-semibold text-[17px] tracking-tight text-navy">
              Dairy<span className="text-mint">Chain</span>
            </span>
          </div>

          {/* Header */}
          <h2 className="font-serif text-[32px] font-bold text-ink-primary leading-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-[15px] text-ink-secondary">
            Sign in to your account to continue
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-ink-primary mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@dairychain.in"
                  className="w-full rounded-lg border border-border-medium pl-10 pr-4 py-3 text-sm text-ink-primary placeholder:text-ink-muted/60 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-ink-primary">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-navy hover:text-navy-deep hover:underline transition-colors"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border-medium pl-10 pr-11 py-3 text-sm text-ink-primary placeholder:text-ink-muted/60 focus:border-navy focus:ring-2 focus:ring-navy/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-ink-muted hover:text-ink-secondary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-danger/5 border border-danger/20">
                <AlertCircle className="w-4 h-4 text-danger shrink-0" />
                <p className="text-sm text-danger font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all duration-150 ${
                isLoading
                  ? 'bg-navy/70 cursor-not-allowed'
                  : 'bg-navy hover:bg-navy-deep cursor-pointer'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-ink-muted font-medium">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Request access */}
          <button
            type="button"
            onClick={() => setShowRequestModal(true)}
            className="w-full rounded-lg border-2 border-border py-3 text-sm font-semibold text-ink-secondary hover:border-navy hover:text-navy transition-all"
          >
            Request access
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-ink-muted">
            Don't have an account?{' '}
            <span className="text-navy font-medium">Contact your administrator</span>
          </p>

          {/* Demo credentials collapsible */}
          <div className="mt-6 border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-ink-muted hover:text-ink-secondary hover:bg-page/50 transition-colors"
            >
              <span>Demo credentials</span>
              {showDemo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showDemo && (
              <div className="border-t border-border">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-page/60">
                      <th className="text-left px-4 py-2 font-semibold text-ink-muted">Role</th>
                      <th className="text-left px-4 py-2 font-semibold text-ink-muted">Email</th>
                      <th className="text-left px-4 py-2 font-semibold text-ink-muted">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_ACCOUNTS.map((acc) => (
                      <tr
                        key={acc.email}
                        onClick={() => fillDemo(acc)}
                        className="border-t border-border cursor-pointer hover:bg-navy/5 transition-colors"
                      >
                        <td className="px-4 py-2 font-medium text-ink-secondary">{acc.label}</td>
                        <td className="px-4 py-2 font-mono text-ink-primary">{acc.email}</td>
                        <td className="px-4 py-2 font-mono text-ink-primary">{acc.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <RequestAccessModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </div>
  );
}
