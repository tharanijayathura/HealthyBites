import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { post } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { setAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const adminAccount = await post('/admin/login', { email: email.trim(), password });
      setAdmin(adminAccount);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page flex items-center justify-center">
      <div className="auth-card w-full max-w-md rounded-[2rem] p-7 md:p-10">
        <div className="relative text-center mb-8">
          <div className="auth-icon w-16 h-16 rounded-2xl border flex items-center justify-center text-[#6C8C17] mx-auto mb-5">
            <img src="/images/logo.png" alt="Healthy Bite logo" className="auth-logo-image" />
          </div>
          <span className="eyebrow justify-center">STAFF PORTAL</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to <span className="brand-leaf">Control.</span></h1>
          <p className="text-xs text-[#A9ADA2]">
            Enter your authorized credentials to manage meals, weekly menus, and customer orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-xs mb-5 flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Admin Email</label>
            <div className="relative mt-1">
              <input
                type="email"
                className="form-control pl-10"
                placeholder="healthyxxxbites@gmail.com"
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
                placeholder="••••••••••••"
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
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={17} />
          </button>
        </form>

      </div>
    </main>
  );
}
