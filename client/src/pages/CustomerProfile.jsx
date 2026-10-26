import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, MapPin, ShoppingBag, Clock, CheckCircle2, LogOut, Edit2, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get } from '../api/client';
import { money } from '../utils/money';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, logoutCustomer, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', whatsappNumber: '', address: '' });
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        whatsappNumber: user.whatsappNumber || '',
        address: user.address || ''
      });

      get('/auth/my-orders')
        .then(data => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await updateProfile(form);
      setEditing(false);
      setNotice('Profile updated successfully.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  const handleLogout = async () => {
    await logoutCustomer();
    navigate('/', { replace: true });
  };

  if (authLoading || !user) {
    return (
      <main className="container section-py text-center">
        <p className="text-[#A9ADA2]">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="container section-py">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#2C3821]">
        <div>
          <span className="eyebrow">CUSTOMER PORTAL</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            My <span className="brand-leaf">Account.</span>
          </h1>
          <p className="text-xs text-[#A9ADA2]">
            Signed in with <strong className="text-white">{user.email}</strong>
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm text-xs"
          onClick={handleLogout}
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-[#263117] border border-[#657539] text-[#DDE8CB] text-sm">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-5 bg-[#1A2110] border border-[#2C3821] rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2C3821]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User size={18} className="text-[#6C8C17]" /> Profile Details
            </h3>
            <button
              type="button"
              className="text-xs text-[#6C8C17] hover:underline flex items-center gap-1 font-semibold"
              onClick={() => setEditing(!editing)}
            >
              <Edit2 size={13} /> {editing ? 'Cancel' : 'Edit Details'}
            </button>
          </div>

          {!editing ? (
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-[#A9ADA2] block mb-0.5">Full Name</span>
                <strong className="text-white text-base">{user.name}</strong>
              </div>

              <div>
                <span className="text-xs text-[#A9ADA2] block mb-0.5">Contact Phone</span>
                <div className="text-[#DDE8CB]">{user.phone}</div>
              </div>

              <div>
                <span className="text-xs text-[#A9ADA2] block mb-0.5">WhatsApp Number</span>
                <div className="text-[#DDE8CB]">{user.whatsappNumber || user.phone}</div>
              </div>

              <div>
                <span className="text-xs text-[#A9ADA2] block mb-0.5">Default Delivery Address</span>
                <div className="text-white bg-[#090B01] p-3 rounded-xl border border-[#2C3821] text-xs leading-relaxed">
                  {user.address || 'No default address saved yet. Add one to speed up future checkouts.'}
                </div>
              </div>

              <div className="pt-2">
                <Link to="/menu" className="btn btn-primary btn-block">
                  Order This Week's Meals <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-sm">
              <div className="form-group mb-0">
                <label className="text-xs text-[#DDE8CB]">Full Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label className="text-xs text-[#DDE8CB]">Phone Number *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label className="text-xs text-[#DDE8CB]">WhatsApp Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                />
              </div>

              <div className="form-group mb-0">
                <label className="text-xs text-[#DDE8CB]">Default Delivery Address</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block">
                Save Profile Changes
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-7 bg-[#1A2110] border border-[#2C3821] rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2C3821]">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#6C8C17]" /> Past Gym Meal Orders ({orders.length})
            </h3>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-xs text-[#A9ADA2]">
              Loading your order history...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-full bg-[#090B01] border border-[#2C3821] flex items-center justify-center text-[#6C8C17] mx-auto mb-3">
                <ShoppingBag size={24} />
              </div>
              <h4 className="font-bold text-white text-base mb-1">No orders placed yet</h4>
              <p className="text-xs text-[#A9ADA2] max-w-sm mx-auto mb-5">
                Browse our Monday through Sunday weekly menus to build your first healthy meal box!
              </p>
              <Link to="/menu" className="btn btn-outline btn-sm">
                Explore Weekly Menu
              </Link>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {orders.map(order => (
                <div
                  key={order._id}
                  className="bg-[#090B01] border border-[#2C3821] rounded-2xl p-5 hover:border-[#4D642C] transition-all"
                >
                  <div className="flex items-start justify-between pb-3 mb-3 border-b border-[#2C3821] gap-2">
                    <div>
                      <strong className="text-sm font-bold brand-leaf">{order.code}</strong>
                      <div className="text-[11px] text-[#A9ADA2]">
                        {new Date(order.createdAt).toLocaleDateString('en-LK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>

                    <span className={`badge-tag text-[10px] uppercase ${
                      order.status === 'confirmed' ? 'bg-[#3C7100]/30 text-[#DDE8CB]' :
                      order.status === 'pending_whatsapp' ? 'bg-[#D8BE8C]/20 text-[#D8BE8C]' :
                      order.status === 'completed' ? 'bg-[#6C8C17]/20 text-[#6C8C17]' :
                      'bg-red-900/30 text-red-200'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5 mb-3 text-xs">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="profile-order-item flex justify-between gap-3 text-[#A9ADA2]">
                        <span className="text-white min-w-0 break-words">
                          {item.quantity} × {item.name}
                        </span>
                        <span className="flex-shrink-0">{money(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#2C3821]/60 text-xs">
                    <span className="text-[#A9ADA2]">
                      Total ({order.customer?.orderType === 'pickup' ? 'Pickup' : 'Delivery'})
                    </span>
                    <strong className="text-white text-sm">{money(order.total)}</strong>
                  </div>

                  {order.status === 'pending_whatsapp' && (
                    <div className="mt-3 pt-2 border-t border-[#2C3821]/40 flex justify-end">
                      <a
                        href={`https://wa.me/94712599785?text=${encodeURIComponent(`Hi Healy Bite! Following up on order ${order.code} for ${order.customer?.name}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#6C8C17] hover:underline"
                      >
                        <MessageCircle size={13} /> Chat with Kitchen on WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
