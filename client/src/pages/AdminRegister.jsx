import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Lock, Mail, User } from 'lucide-react';
import { post } from '../api/client';

export default function AdminRegister() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await post('/admin/register', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-page flex items-center justify-center">
      <div className="auth-card w-full max-w-md rounded-[2rem] p-7 md:p-10">
        <div className="text-center mb-8">
          <div className="auth-icon w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto mb-5">
            <img src="/images/logo.png" alt="Healthy Bite logo" className="auth-logo-image" />
          </div>
          <span className="eyebrow justify-center">STAFF ACCESS</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Join the <span className="brand-leaf">team.</span></h1>
          <p className="text-xs text-[#A9ADA2]">Request access to manage meals, orders, and business data.</p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#263117] border border-[#657539] text-[#DDE8CB] text-sm space-y-4">
            <p>Your staff account request was submitted and is awaiting super-admin approval.</p>
            <Link to="/login" className="btn btn-outline btn-sm w-full">Go to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Name *</label>
              <div className="relative mt-1">
                <input className="form-control pl-10" value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <User size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              </div>
            </div>
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Email *</label>
              <div className="relative mt-1">
                <input type="email" className="form-control pl-10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <Mail size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              </div>
            </div>
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Password (8+ characters) *</label>
              <div className="relative mt-1">
                <input type="password" className="form-control pl-10" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <Lock size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
              </div>
            </div>
            <div className="form-group mb-0">
              <label className="text-xs font-semibold text-[#DDE8CB]">Confirm Password *</label>
              <input type="password" className="form-control mt-1" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg mt-6" disabled={loading}>
              {loading ? 'Submitting...' : 'Request Staff Access'} <ArrowRight size={17} />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
