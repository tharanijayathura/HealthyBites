import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, KeyRound, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { post } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminRegister() {
  const navigate = useNavigate();
  const { setAdmin } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    inviteCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await post('/admin/register', form);
      if (res?.pendingApproval) {
        setSuccessMsg('Registration submitted! Your administrator account is now pending review. The Super Admin (healthyxxxbites@gmail.com) must approve your account before you can log in.');
      } else if (res?.email) {
        setAdmin(res);
        navigate('/admin', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Admin registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page flex items-center justify-center">
      <div className="auth-card w-full max-w-md rounded-[2rem] p-7 md:p-10">
        <div className="relative text-center mb-8">
          <div className="auth-icon w-16 h-16 rounded-2xl border flex items-center justify-center text-[#6C8C17] mx-auto mb-5">
            <img src="/images/logo.jpeg" alt="Healthy Bite logo" className="auth-logo-image" />
          </div>
          <span className="eyebrow justify-center">STAFF ONBOARDING</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Join the <span className="brand-leaf">team.</span></h1>
          <p className="text-xs text-[#A9ADA2]">
            Create a secure administrator account to manage menus, orders, analytics, and business settings.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-[#263117] border border-[#657539] text-[#DDE8CB] text-xs mb-5 space-y-2">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6C8C17]" />
              Awaiting Super Admin Approval
            </div>
            <p className="leading-relaxed">{successMsg}</p>
            <div className="pt-2">
              <Link to="/admin/login" className="btn btn-outline btn-sm w-full text-xs">
                Go to Admin Sign In
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-xs mb-5 flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Administrator Name *</label>
            <div className="relative mt-1">
              <input
                type="text"
                className="form-control pl-10"
                placeholder="Manager Name"
                value={form.name}
                maxLength={80}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <User size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Official Admin Email *</label>
            <div className="relative mt-1">
              <input
                type="email"
                className="form-control pl-10"
                placeholder="admin@healybite.lk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Mail size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Secure Password (8+ characters) *</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control pl-10"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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

          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Confirm Password *</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-control pl-10 pr-12"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
              <Lock size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              <button
                type="button"
                className="absolute right-3 top-3 text-[#A9ADA2] hover:text-white"
                onClick={() => setShowConfirmPassword(value => !value)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">
              Admin Invitation Key
            </label>
            <div className="relative mt-1">
              <input
                type="text"
                className="form-control pl-10"
                placeholder="Enter authorization invite code"
                value={form.inviteCode}
                onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
              />
              <KeyRound size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
            </div>
            <small className="text-[11px] text-[#A9ADA2] block mt-1">
              Use the invitation key provided by the business owner.
            </small>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-6"
            disabled={loading}
          >
            {loading ? 'Registering Admin...' : 'Register Administrator'}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="relative mt-8 pt-6 border-t border-[#2C3821] text-center text-xs text-[#A9ADA2]">
          Already have an admin account?{' '}
          <Link to="/admin/login" className="text-[#6C8C17] font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </main>
  );
}
