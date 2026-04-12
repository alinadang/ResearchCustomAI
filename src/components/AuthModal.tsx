import { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type AuthTab = 'login' | 'register';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // Register form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(loginId, loginPw);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(regUsername, regEmail, regPw);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-surface shadow-xl ring-1 ring-border-light overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold text-text-primary">
            {tab === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-text-tertiary transition-colors hover:bg-surface-secondary hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-border-light">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === 'login'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <LogIn size={13} className="inline mr-1.5 -mt-0.5" />
            Log In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              tab === 'register'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <UserPlus size={13} className="inline mr-1.5 -mt-0.5" />
            Register
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username or email"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                autoFocus
                className="rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 placeholder:text-text-tertiary"
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 placeholder:text-text-tertiary"
              />
              <button
                type="submit"
                disabled={isSubmitting || !loginId || !loginPw}
                className="mt-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                autoFocus
                className="rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 placeholder:text-text-tertiary"
              />
              <input
                type="email"
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 placeholder:text-text-tertiary"
              />
              <input
                type="password"
                placeholder="Password"
                value={regPw}
                onChange={(e) => setRegPw(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface-secondary px-3 py-2.5 text-sm text-text-primary outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400/20 placeholder:text-text-tertiary"
              />
              <button
                type="submit"
                disabled={isSubmitting || !regUsername || !regEmail || !regPw}
                className="mt-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
