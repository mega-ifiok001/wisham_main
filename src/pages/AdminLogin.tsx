import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Music, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { admin, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (admin) navigate('/admin/dashboard', { replace: true });
  }, [admin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    const res = await login(email, password);
    setIsLoggingIn(false);
    if (res.error) {
      setError(res.error);
    } else {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col">
      <header className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back to site</span>
        </Link>
        <Link to="/" className="flex items-center gap-2 font-black text-lg text-neutral-900">
          <span className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white"><Music className="w-4 h-4" /></span>
          WISHAM
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="inline-flex w-14 h-14 rounded-2xl bg-red-600 text-white items-center justify-center mb-4">
              <Lock className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black">Admin Login</h1>
            <p className="text-sm text-neutral-400 mt-2">Sign in to manage the WISHAM beat store</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-500 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@wisham.com"
                  className="w-full pl-12 pr-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-500 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-neutral-400 hover:text-neutral-900 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isLoggingIn && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isLoggingIn ? 'Signing in…' : 'Sign in to Admin Panel'}
            </button>
          </form>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-neutral-400">
        © {new Date().getFullYear()} WISHAM Admin Portal
      </footer>
    </div>
  );
};

export default AdminLogin;