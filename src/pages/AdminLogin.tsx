import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Zap, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const { error: signInErr, isAdmin: signedInAsAdmin } = await signIn(email, password);
      
      if (signInErr) {
        setError(signInErr.message || 'Invalid email or password');
        setIsLoggingIn(false);
        return;
      }

      if (signedInAsAdmin) {
        // Direct navigation without race conditions
        navigate('/admin/dashboard', { replace: true });
      } else {
        setError('You do not have admin access. (Ensure your email is an authorized admin account)');
        setIsLoggingIn(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-neutral-100 flex flex-col">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-orange-600/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to site</span>
        </Link>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
       
            <h1 className="text-2xl font-black text-white">Admin Login</h1>
            <p className="text-sm text-neutral-400 mt-2">Sign in to access the admin dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-neutral-500 absolute left-4 top-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ifiokaniebiet@gmail.com"
                  className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-neutral-500 absolute left-4 top-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4  text-neutral-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl  bg-orange-500  text-black font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          {/* Help text */}
          {/* <div className="mt-8 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
            <p className="text-xs text-neutral-400 text-center">
              <strong className="text-neutral-300">Admin Access Rule:</strong><br />
              Authorized admin accounts: <code className="text-orange-400">ifiokaniebiet@gmail.com</code> or any email starting with <code className="text-orange-400">admin@</code>.
            </p>
          </div> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-neutral-600">© {new Date().getFullYear()} Wisham Admin Portal</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
