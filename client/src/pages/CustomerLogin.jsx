import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from || '/menu';
  const redirectMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const account = await loginCustomer(email.trim(), password);
      navigate(account?.admin ? '/admin' : redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page flex items-center justify-center">
      <div className="auth-card w-full max-w-md rounded-4xl p-7 md:p-10">
        <div className="relative text-center mb-8">
          <div className="auth-icon w-16 h-16 rounded-2xl border flex items-center justify-center text-[#6C8C17] mx-auto mb-5">
            <img src="/images/logo.png" alt="Healthy Bite logo" className="auth-logo-image" />
          </div>
          <span className="eyebrow justify-center">WELCOME BACK, ATHLETE</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Fuel your next <span className="brand-leaf">win.</span></h1>
          <p className="text-xs text-[#A9ADA2]">
            Sign in to access your saved delivery address, pre-filled checkout, and meal order history.
          </p>
        </div>

        {redirectMessage && (
          <div className="p-3.5 rounded-xl bg-[#263117] border border-[#657539] text-[#DDE8CB] text-xs mb-5 flex items-center gap-2.5">
            <Lock size={16} className="text-[#6C8C17] shrink-0" />
            <span>{redirectMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-xs mb-5 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                className="form-control pl-10"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control pl-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              <button
                type="button"
                className="absolute right-3 top-3 text-[#A9ADA2] hover:text-white"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-6"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="relative mt-8 pt-6 border-t border-[#2C3821] flex flex-col gap-3 text-center text-xs text-[#A9ADA2]">
          <div>
            <span className="block mb-3">Don't have a Healy Bite account?</span>
            <Link to="/register" className="auth-register-link">
              <span>Create an Account</span>
              <ArrowRight size={15} />
            </Link>
          </div>
          <div>
            Or explore without signing in:{' '}
            <Link to="/menu" className="text-white hover:underline">
              Browse Menu as Guest
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
