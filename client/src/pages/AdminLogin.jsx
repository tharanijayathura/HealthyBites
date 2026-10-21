import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { post } from '../api/client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await post('/admin/login', { email: email.trim(), password });
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator login credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container section-py flex items-center justify-center min-h-[75vh]">
      <div className="w-full max-w-md bg-[#1A2110] border border-[#2C3821] rounded-3xl p-8 md:p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#090B01] border border-[#384628] flex items-center justify-center text-[#6C8C17] mx-auto mb-4 shadow-lg">
            <Leaf size={28} />
          </div>
          <span className="eyebrow justify-center">STAFF PORTAL</span>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Sign In</h1>
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
                type="password"
                className="form-control pl-10"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={16} className="absolute left-3.5 top-4 text-[#A9ADA2]" />
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

        <div className="mt-8 pt-4 border-t border-[#2C3821] text-center text-xs text-[#A9ADA2]">
          Need to create or reset the administrator password? Follow the instructions in the project server script.
        </div>
      </div>
    </main>
  );
}
