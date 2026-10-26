import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, MapPin, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerRegister() {
  const navigate = useNavigate();
  const { registerCustomer } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    whatsappNumber: '',
    address: ''
  });
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await registerCustomer({
        ...form,
        whatsappNumber: sameAsPhone ? form.phone : (form.whatsappNumber || form.phone)
      });
      navigate('/menu', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page flex items-center justify-center">
      <div className="auth-card w-full max-w-lg rounded-4xl p-7 md:p-10">
        <div className="relative text-center mb-8">
          <div className="auth-icon w-16 h-16 rounded-2xl border flex items-center justify-center text-[#6C8C17] mx-auto mb-5">
            <img src="/images/logo.png" alt="Healthy Bite logo" className="auth-logo-image" />
          </div>
          <span className="eyebrow justify-center">JOIN HEALY BITE</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Start eating <span className="brand-leaf">better.</span></h1>
          <p className="text-xs text-[#A9ADA2]">
            Enjoy 1-click checkout, saved dietary preferences, and track your weekly gym orders.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-xs mb-5 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative space-y-4">
          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Full Name *</label>
            <div className="relative mt-1">
              <input
                type="text"
                className="form-control pl-10"
                placeholder="Kasun Perera"
                value={form.name}
                maxLength={100}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <User size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Email Address *</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  className="form-control pl-10"
                  placeholder="kasun@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              </div>
            </div>

            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Password (6+ chars) *</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control pl-10"
                  placeholder="••••••••"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Phone Number *</label>
              <div className="relative mt-1">
                <input
                  type="tel"
                  className="form-control pl-10"
                  placeholder="0771234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
                <Phone size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              </div>
            </div>

            <div className="form-group mb-0">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#DDE8CB]">WhatsApp</label>
                <label className="auth-toggle-label">
                  <input
                    className="auth-toggle-input"
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => setSameAsPhone(e.target.checked)}
                    aria-label="Use contact phone for WhatsApp"
                  />
                  <span className="auth-toggle-track" aria-hidden="true">
                    <span className="auth-toggle-thumb" />
                  </span>
                  <span>{sameAsPhone ? 'Same number' : 'Different number'}</span>
                </label>
              </div>
              {!sameAsPhone ? (
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0712599785"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              ) : (
                <div className="text-xs text-[#6C8C17] py-2 px-1">Using contact phone</div>
              )}
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="text-xs font-semibold text-[#DDE8CB]">Default Colombo Delivery Address</label>
            <div className="relative mt-1">
              <textarea
                className="form-control pl-10"
                rows={2}
                placeholder="e.g. No. 45, Duplication Road, Colombo 03"
                value={form.address}
                maxLength={300}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <MapPin size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg mt-6"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Complete Registration'}
            <ArrowRight size={17} />
          </button>
        </form>

        <div className="relative mt-8 pt-6 border-t border-[#2C3821] text-center text-xs text-[#A9ADA2]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6C8C17] font-semibold hover:underline">
            Sign In here
          </Link>
          <div className="mt-4">
            Staff member?{' '}
            <Link to="/admin/register" className="text-[#6C8C17] font-semibold hover:underline">
              Request staff access
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
