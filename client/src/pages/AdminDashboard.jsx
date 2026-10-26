import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  MessageCircle,
  Truck,
  Store,
  DollarSign,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Flame,
  Dumbbell,
  BarChart3,
  ShieldCheck
} from 'lucide-react';
import { get, post, put, patch, del, uploadImage } from '../api/client';
import { DAYS } from '../utils/dates';
import { money } from '../utils/money';

const FOOD_PRESETS = [
  { url: '/images/food/1.png', label: 'Chicken Greens' },
  { url: '/images/food/2.png', label: 'Steak & Eggs' },
  { url: '/images/food/3.png', label: 'Acai Bowl' },
  { url: '/images/food/4.png', label: 'Salmon Potato' },
  { url: '/images/food/5.png', label: 'Crispy Chicken' },
  { url: '/images/food/6.png', label: 'Roast Chicken' },
  { url: '/images/food/7.png', label: 'Sweet Potato' }
];

const CATEGORIES = [
  'High Protein',
  'Lean & Cut',
  'Keto & Low Carb',
  'Clean Bulk',
  'Omega-3 & Recovery',
  'Pre-Workout & Energy'
];

const statusOptions = ['pending_whatsapp', 'confirmed', 'preparing', 'completed', 'cancelled'];

const emptyMealForm = {
  name: '',
  description: '',
  price: '',
  category: 'High Protein',
  imageUrl: '/images/food/1.png',
  availableDays: ['Monday'],
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  ingredients: '',
  allergens: '',
  stock: 50,
  isActive: true,
  isSoldOut: false
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [superAnalytics, setSuperAnalytics] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({
    businessName: 'Healy Bite',
    tagline: 'Fuel Your Fitness. Nourish Your Body.',
    email: '',
    phone: '',
    whatsappNumber: '',
    deliveryFee: 250,
    pickupLocation: 'Healy Bite Hub, Colombo 03, Sri Lanka',
    cutoffTime: '11:00 PM',
    orderThrough: 'Wholesome, delicious meals made to nourish your body and power your day.',
    deliveryAreas: 'Moratuwa, Rawathawatta, Katubedda, Angulana, Rathmalana, Suwarapola, Piliyandala',
    paymentMethod: 'COD only',
    description: ''
  });

  const [activeTab, setActiveTab] = useState('meals');
  const [mealForm, setMealForm] = useState(emptyMealForm);
  const [editingMealId, setEditingMealId] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const refreshData = async () => {
    try {
      const [mealsRes, ordersRes, settingsRes, statsRes, analyticsRes, superAnalyticsRes, adminsRes, usersRes] = await Promise.all([
        get('/admin/meals'),
        get('/admin/orders'),
        get('/admin/settings'),
        get('/admin/stats').catch(() => null),
        get('/admin/analytics').catch(() => null),
        get('/admin/super-analytics').catch(() => null),
        get('/admin/admins').catch(() => []),
        get('/admin/users').catch(() => [])
      ]);
      setMeals(mealsRes || []);
      setOrders(ordersRes || []);
      setSettings(s => ({ ...s, ...(settingsRes || {}) }));
      if (statsRes) setStats(statsRes);
      if (analyticsRes) setAnalytics(analyticsRes);
      if (superAnalyticsRes) setSuperAnalytics(superAnalyticsRes);
      setAdmins(adminsRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      setError(err.message || 'Error refreshing dashboard data');
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await get('/admin/me');
        if (!active) return;
        setAdmin(me);
        await refreshData();
      } catch (err) {
        if (active) {
          navigate('/admin/login', { replace: true });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [navigate]);

  const showNotification = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await post('/admin/logout', {});
    } catch {}
    navigate('/admin/login', { replace: true });
  };

  const handleApproveAdmin = async (adminId) => {
    try {
      await patch(`/admin/admins/${adminId}/approve`, {});
      await refreshData();
      showNotification('Administrator approved successfully.');
    } catch (err) {
      setError(err.message || 'Could not approve administrator.');
    }
  };

  const handleRemoveUser = async (user) => {
    if (!window.confirm(`Remove customer account for ${user.name}? Their order history will be preserved.`)) return;
    try {
      await del(`/admin/users/${user._id}`);
      await refreshData();
      showNotification('Customer account removed.');
    } catch (err) {
      setError(err.message || 'Could not remove customer account.');
    }
  };

  // Meal Form Handlers
  const handleEditMeal = (meal) => {
    setEditingMealId(meal._id);
    setMealForm({
      name: meal.name,
      description: meal.description || '',
      price: meal.price,
      category: meal.category || 'High Protein',
      imageUrl: meal.imageUrl || '/images/food/1.png',
      availableDays: meal.availableDays || [],
      calories: meal.calories ?? '',
      protein: meal.protein ?? '',
      carbs: meal.carbs ?? '',
      fat: meal.fat ?? '',
      ingredients: Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : '',
      allergens: Array.isArray(meal.allergens) ? meal.allergens.join(', ') : '',
      stock: meal.stock ?? 50,
      isActive: meal.isActive !== false,
      isSoldOut: Boolean(meal.isSoldOut)
    });
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const toggleFormDay = (day) => {
    setMealForm(f => {
      const exists = f.availableDays.includes(day);
      return {
        ...f,
        availableDays: exists ? f.availableDays.filter(d => d !== day) : [...f.availableDays, day]
      };
    });
  };

  const handleSaveMeal = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      ...mealForm,
      price: Number(mealForm.price),
      calories: mealForm.calories !== '' ? Number(mealForm.calories) : null,
      protein: mealForm.protein !== '' ? Number(mealForm.protein) : null,
      carbs: mealForm.carbs !== '' ? Number(mealForm.carbs) : null,
      fat: mealForm.fat !== '' ? Number(mealForm.fat) : null,
      stock: mealForm.stock !== '' ? Number(mealForm.stock) : 50
    };

    try {
      if (editingMealId) {
        await put(`/admin/meals/${editingMealId}`, payload);
        showNotification(`Updated meal "${payload.name}" successfully.`);
      } else {
        await post('/admin/meals', payload);
        showNotification(`Created new meal "${payload.name}".`);
      }
      setEditingMealId(null);
      setMealForm(emptyMealForm);
      await refreshData();
    } catch (err) {
      setError(err.message || 'Could not save meal.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setUploadingImage(true);
    try {
      const response = await uploadImage(file);
      setMealForm(current => ({ ...current, imageUrl: response.imageUrl }));
      showNotification('Meal image uploaded successfully.');
    } catch (err) {
      setError(err.message || 'Could not upload meal image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleToggleSoldOut = async (mealId) => {
    try {
      await patch(`/admin/meals/${mealId}/toggle-soldout`, {});
      await refreshData();
      showNotification('Meal availability updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteMeal = async (meal) => {
    if (window.confirm(`Are you sure you want to delete or archive "${meal.name}"?`)) {
      try {
        await del(`/admin/meals/${meal._id}?permanent=true`);
        await refreshData();
        showNotification(`Deleted "${meal.name}".`);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Order Status Handler
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      await refreshData();
      showNotification(`Order status updated to ${newStatus.replace('_', ' ')}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await put('/admin/settings', settings);
      showNotification('Business settings saved successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    if (orderFilter !== 'all' && order.status !== orderFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      const codeMatch = order.code?.toLowerCase().includes(q);
      const nameMatch = order.customer?.name?.toLowerCase().includes(q);
      const phoneMatch = order.customer?.phone?.includes(q);
      if (!codeMatch && !nameMatch && !phoneMatch) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <main className="container section-py text-center">
        <p className="text-[#A9ADA2]">Loading Admin Portal...</p>
      </main>
    );
  }

  return (
    <main className="container section-py">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#2C3821]">
        <div>
          <span className="eyebrow">HEALY BITE OPERATIONS HUB</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-1">
            Admin <span className="brand-leaf">Control Center.</span>
          </h1>
          <p className="text-xs text-[#A9ADA2]">
            Signed in as <strong className="text-white">{admin?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={refreshData}
            title="Refresh database records"
          >
            <RefreshCw size={15} /> Refresh Data
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="stat-label">Total Meals</span>
          <strong>{meals.length}</strong>
          <small className="text-xs text-[#6C8C17] mt-1 font-semibold">
            {meals.filter(m => m.isActive && !m.isSoldOut).length} Active &amp; Ready
          </small>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">Pending WhatsApp Orders</span>
          <strong className="text-[#D8BE8C]">
            {orders.filter(o => o.status === 'pending_whatsapp').length}
          </strong>
          <small className="text-xs text-[#A9ADA2] mt-1">Awaiting client message</small>
        </div>

        <div className="admin-stat-card highlight">
          <span className="stat-label">Confirmed Orders</span>
          <strong>{orders.filter(o => o.status === 'confirmed').length}</strong>
          <small className="text-xs text-[#DDE8CB] mt-1">Verified with customer</small>
        </div>

        <div className="admin-stat-card">
          <span className="stat-label">Verified Order Revenue</span>
          <strong className="brand-leaf">
            {money(stats?.verifiedRevenue || orders.filter(o => ['confirmed', 'preparing', 'completed'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0))}
          </strong>
          <small className="text-xs text-[#A9ADA2] mt-1">Confirmed + Completed</small>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Admin Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-[#2C3821] pb-3 mb-8">
        {[
          ['meals', 'Meals Management'],
          ['schedule', 'Weekly Menu Matrix'],
          ['analytics', 'Analytics'],
          ['orders', `Orders (${orders.length})`],
          ['settings', 'Business Settings'],
          ...(admin?.role === 'superadmin' ? [
            ['users', `Customers (${users.length})`],
            ['team', admins.filter(a => a.status === 'pending').length > 0
              ? `Admin Approvals (${admins.filter(a => a.status === 'pending').length} Pending!)`
              : 'Admin Approvals'
            ]
          ] : [])
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === id
                ? 'bg-[#6C8C17] text-[#090B01] font-bold shadow-lg'
                : 'bg-[#1A2110] text-[#A9ADA2] hover:text-white'
            }`}
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: MEALS MANAGEMENT */}
      {activeTab === 'meals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 form-panel">
            <h2 className="text-xl font-bold mb-4 text-[#DDE8CB]">
              {editingMealId ? 'Edit Gym Meal' : 'Add New Gym Meal'}
            </h2>

            <form onSubmit={handleSaveMeal} className="space-y-4">
              <div className="form-group mb-0">
                <label>Meal Title *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Grilled Chicken & Greens"
                  value={mealForm.name}
                  maxLength={100}
                  onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label>Category</label>
                <select
                  className="form-control"
                  value={mealForm.category}
                  onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group mb-0">
                <label>Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Appetizing description of ingredients and training benefits..."
                  value={mealForm.description}
                  maxLength={500}
                  onChange={(e) => setMealForm({ ...mealForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-group mb-0">
                  <label>Price (LKR) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    className="form-control"
                    placeholder="1250"
                    value={mealForm.price}
                    onChange={(e) => setMealForm({ ...mealForm, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group mb-0">
                  <label>Portion Stock</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    placeholder="50"
                    value={mealForm.stock}
                    onChange={(e) => setMealForm({ ...mealForm, stock: e.target.value })}
                  />
                </div>
              </div>

              {/* Visual Meal Photo Selector */}
              <div className="form-group mb-0">
                <label className="flex items-center justify-between">
                  <span>Meal Photography</span>
                  <span className="text-[11px] text-[#A9ADA2]">Select high-res food image</span>
                </label>
                <div className="image-picker-grid">
                  {FOOD_PRESETS.map((preset) => (
                    <div
                      key={preset.url}
                      className={`image-thumb-option ${mealForm.imageUrl === preset.url ? 'selected' : ''}`}
                      onClick={() => setMealForm({ ...mealForm, imageUrl: preset.url })}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} />
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-control text-xs"
                  placeholder="Or enter custom image URL: /images/food/1.png or https://..."
                  value={mealForm.imageUrl}
                  onChange={(e) => setMealForm({ ...mealForm, imageUrl: e.target.value })}
                />
                <label className="btn btn-outline btn-sm mt-2 inline-flex cursor-pointer">
                  {uploadingImage ? 'Uploading image...' : 'Upload image from device'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {/* Macros Row */}
              <div className="bg-[#090B01] border border-[#2C3821] rounded-xl p-3">
                <span className="text-xs font-bold text-[#DDE8CB] uppercase tracking-wider block mb-2">
                  Macros &amp; Nutrition (Per Serving)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#A9ADA2]">Calories</label>
                    <input
                      type="number"
                      className="form-control text-xs p-2 mb-0"
                      placeholder="520"
                      value={mealForm.calories}
                      onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#6C8C17] font-bold">Protein (g)</label>
                    <input
                      type="number"
                      className="form-control text-xs p-2 mb-0 border-[#6C8C17]/40"
                      placeholder="52"
                      value={mealForm.protein}
                      onChange={(e) => setMealForm({ ...mealForm, protein: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A9ADA2]">Carbs (g)</label>
                    <input
                      type="number"
                      className="form-control text-xs p-2 mb-0"
                      placeholder="16"
                      value={mealForm.carbs}
                      onChange={(e) => setMealForm({ ...mealForm, carbs: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#A9ADA2]">Fat (g)</label>
                    <input
                      type="number"
                      className="form-control text-xs p-2 mb-0"
                      placeholder="18"
                      value={mealForm.fat}
                      onChange={(e) => setMealForm({ ...mealForm, fat: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Ingredients & Allergens */}
              <div className="form-group mb-0">
                <label>Ingredients (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Chicken Breast, Steamed Broccoli, Farm Eggs..."
                  value={mealForm.ingredients}
                  onChange={(e) => setMealForm({ ...mealForm, ingredients: e.target.value })}
                />
              </div>

              <div className="form-group mb-0">
                <label>Allergens (comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Eggs, Fish, Tree Nuts..."
                  value={mealForm.allergens}
                  onChange={(e) => setMealForm({ ...mealForm, allergens: e.target.value })}
                />
              </div>

              {/* Available Weekdays */}
              <div className="form-group mb-0">
                <label>Available On Weekdays</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DAYS.map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        mealForm.availableDays.includes(day)
                          ? 'bg-[#6C8C17] text-[#090B01] border-[#6C8C17]'
                          : 'bg-[#090B01] text-[#A9ADA2] border-[#2C3821]'
                      }`}
                      onClick={() => toggleFormDay(day)}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs cursor-pointer text-[#DDE8CB]">
                  <input
                    type="checkbox"
                    checked={mealForm.isActive}
                    onChange={(e) => setMealForm({ ...mealForm, isActive: e.target.checked })}
                  />
                  Active (Customer Visible)
                </label>

                <label className="flex items-center gap-2 text-xs cursor-pointer text-[#FFB3A8]">
                  <input
                    type="checkbox"
                    checked={mealForm.isSoldOut}
                    onChange={(e) => setMealForm({ ...mealForm, isSoldOut: e.target.checked })}
                  />
                  Mark Sold Out
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingMealId ? 'Save Changes' : 'Create Meal'}
                </button>
                {editingMealId && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingMealId(null);
                      setMealForm(emptyMealForm);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Meal Inventory List */}
          <div className="lg:col-span-7 bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              <span>All Menu Dishes ({meals.length})</span>
            </h2>

            <div className="space-y-4 max-h-[780px] overflow-y-auto pr-1">
              {meals.map(meal => (
                <div
                  key={meal._id}
                  className="bg-[#090B01] border border-[#2C3821] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={meal.imageUrl || '/images/food/1.png'}
                      alt={meal.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-[#2C3821]"
                      onError={(e) => { e.target.src = '/images/food/1.png'; }}
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm mb-0.5">{meal.name}</h4>
                      <div className="text-xs text-[#6C8C17] font-semibold mb-1">
                        {money(meal.price)} · {meal.protein ? `${meal.protein}g Protein` : 'Macro tracked'}
                      </div>
                      <div className="flex flex-wrap gap-1 text-[10px] text-[#A9ADA2]">
                        {meal.availableDays?.map(d => (
                          <span key={d} className="bg-[#1A2110] px-1.5 py-0.5 rounded border border-[#2C3821]">
                            {d.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      className={`btn btn-sm ${meal.isSoldOut ? 'bg-[#4A1E1B] text-[#FFB3A8]' : 'btn-outline text-xs'}`}
                      onClick={() => handleToggleSoldOut(meal._id)}
                    >
                      {meal.isSoldOut ? 'Sold Out' : 'Available'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditMeal(meal)}
                      title="Edit meal"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteMeal(meal)}
                      title="Delete meal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEEKLY SCHEDULE MATRIX */}
      {activeTab === 'schedule' && (
        <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-2">Weekly Meal Rotation Matrix</h2>
          <p className="text-sm text-[#A9ADA2] mb-6">
            Visual breakdown of all meals scheduled across Monday through Sunday.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {DAYS.map(day => {
              const dayMeals = meals.filter(m => m.availableDays?.includes(day));
              return (
                <div key={day} className="bg-[#090B01] border border-[#2C3821] rounded-xl p-3.5 flex flex-col">
                  <div className="pb-2 mb-3 border-b border-[#2C3821] flex items-center justify-between">
                    <strong className="text-sm text-[#DDE8CB]">{day}</strong>
                    <span className="text-xs bg-[#1A2110] text-[#6C8C17] font-bold px-2 py-0.5 rounded-full">
                      {dayMeals.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {dayMeals.length === 0 ? (
                      <p className="text-xs text-[#667258] italic py-4 text-center">No meals assigned</p>
                    ) : (
                      dayMeals.map(m => (
                        <div
                          key={m._id}
                          className="p-2 rounded-lg bg-[#141A0D] border border-[#2C3821] text-xs flex items-center gap-2"
                        >
                          <img
                            src={m.imageUrl || '/images/food/1.png'}
                            alt={m.name}
                            className="w-7 h-7 rounded object-cover flex-shrink-0"
                            onError={(e) => { e.target.src = '/images/food/1.png'; }}
                          />
                          <span className="truncate flex-1 text-white">{m.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ORDER MANAGEMENT */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {superAnalytics && (
            <div className="bg-[#1A2110] border border-[#6C8C17] rounded-2xl p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <span className="eyebrow">BUSINESS OVERVIEW</span>
                  <h2 className="text-xl font-bold mt-1">Executive Analytics</h2>
                  <p className="text-sm text-[#A9ADA2] mt-1">
                    Business performance across orders, revenue, customers, meals, and staff.
                  </p>
                </div>
                <ShieldCheck className="text-[#6C8C17]" size={28} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-8">
                {[
                  ['Verified Revenue', money(superAnalytics.totals.totalRevenue)],
                  ['Orders', superAnalytics.totals.totalOrders],
                  ['Portions Sold', superAnalytics.totals.totalPortions],
                  ['Customers', superAnalytics.totals.registeredCustomers],
                  ['Staff Accounts', superAnalytics.totals.administratorAccounts],
                  ['Meals', superAnalytics.totals.meals]
                ].map(([label, value]) => (
                  <div key={label} className="bg-[#090B01] border border-[#2C3821] rounded-xl p-3">
                    <span className="stat-label">{label}</span>
                    <strong className="block text-lg mt-2 text-[#DDE8CB]">{value}</strong>
                  </div>
                ))}
              </div>

              {[
                ['daily', 'Daily — last 7 days'],
                ['weekly', 'Weekly — last 8 weeks'],
                ['monthly', 'Monthly — last 12 months'],
                ['yearly', 'Yearly — last 5 years']
              ].map(([key, title]) => {
                const points = superAnalytics.series?.[key] || [];
                const maxRevenue = Math.max(...points.map(point => point.revenue), 1);
                return (
                  <div key={key} className="bg-[#090B01] border border-[#2C3821] rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">{title}</h3>
                      <span className="text-xs text-[#A9ADA2]">Verified revenue</span>
                    </div>
                    <div className="flex items-end gap-2 h-36">
                      {points.map(point => (
                        <div key={point.label} className="flex-1 h-full flex flex-col justify-end items-center gap-2 min-w-0">
                          <span className="text-[10px] text-[#D8BE8C] truncate max-w-full">{money(point.revenue)}</span>
                          <div
                            className="w-full max-w-12 rounded-t-md bg-[#6C8C17] min-h-1 transition-all"
                            style={{ height: `${Math.max((point.revenue / maxRevenue) * 100, point.revenue ? 5 : 1)}%` }}
                            title={`${point.label}: ${money(point.revenue)}, ${point.orders} orders`}
                          />
                          <span className="text-[10px] text-[#A9ADA2] truncate max-w-full">{point.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">Business Analytics</h2>
                <p className="text-sm text-[#A9ADA2] mt-1">
                  Sales trends and customer ordering preferences from recorded orders.
                </p>
              </div>
              <BarChart3 className="text-[#6C8C17]" size={28} />
            </div>

            {!analytics ? (
              <p className="text-sm text-[#A9ADA2] py-8 text-center">Analytics are not available yet.</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ['Delivery Orders', analytics.orderTypes?.delivery || 0],
                    ['Pickup Orders', analytics.orderTypes?.pickup || 0],
                    ['Registered Customers', stats?.totalRegisteredCustomers || 0]
                  ].map(([label, value]) => (
                    <div key={label} className="bg-[#090B01] border border-[#2C3821] rounded-xl p-4">
                      <span className="stat-label">{label}</span>
                      <strong className="block text-2xl mt-2">{value}</strong>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold mb-3">Top Dishes by Portions</h3>
                    <div className="space-y-2">
                      {(analytics.topDishes || []).length === 0 ? (
                        <p className="text-sm text-[#A9ADA2]">No order data yet.</p>
                      ) : analytics.topDishes.map((dish) => (
                        <div key={dish.name} className="flex items-center justify-between bg-[#090B01] rounded-lg px-3 py-2 text-sm">
                          <span className="text-[#DDE8CB]">{dish.name}</span>
                          <span className="text-[#6C8C17] font-semibold">{dish.portions} portions</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold mb-3">Revenue by Order Status</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.revenueByStatus || {}).map(([status, value]) => (
                        <div key={status} className="flex items-center justify-between bg-[#090B01] rounded-lg px-3 py-2 text-sm">
                          <span className="capitalize text-[#DDE8CB]">{status}</span>
                          <span className="text-[#D8BE8C] font-semibold">{money(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ORDER MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Order Search & Filter Bar */}
          <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['all', 'pending_whatsapp', 'confirmed', 'preparing', 'completed', 'cancelled'].map(st => (
                <button
                  key={st}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    orderFilter === st
                      ? 'bg-[#6C8C17] text-[#090B01] font-bold'
                      : 'bg-[#090B01] text-[#A9ADA2] hover:text-white'
                  }`}
                  onClick={() => setOrderFilter(st)}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative min-w-[260px]">
              <input
                type="text"
                className="form-control text-xs pl-9 mb-0"
                placeholder="Search by Order ID, name, or phone..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              <Search size={15} className="absolute left-3 top-3 text-[#A9ADA2]" />
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-12 text-center">
                <Clock size={36} className="text-[#6C8C17] mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">No Orders Found</h3>
                <p className="text-xs text-[#A9ADA2]">
                  {orderFilter !== 'all' ? `No orders with status "${orderFilter}"` : 'No orders recorded yet.'}
                </p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const customerPhone = order.customer?.phone?.replace(/\D/g, '') || '';
                const cleanWhatsApp = customerPhone.startsWith('0') ? '94' + customerPhone.slice(1) : customerPhone;

                return (
                  <div
                    key={order._id}
                    className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6 transition-all hover:border-[#4D642C]"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 mb-4 border-b border-[#2C3821] gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <strong className="text-lg font-bold brand-leaf">{order.code}</strong>
                          <span className={`badge-tag text-[11px] uppercase ${
                            order.status === 'confirmed' ? 'bg-[#3C7100]/30 text-[#DDE8CB]' :
                            order.status === 'pending_whatsapp' ? 'bg-[#D8BE8C]/20 text-[#D8BE8C]' :
                            order.status === 'completed' ? 'bg-[#6C8C17]/20 text-[#6C8C17]' :
                            'bg-red-900/30 text-red-200'
                          }`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <small className="text-xs text-[#A9ADA2]">
                          Recorded on {new Date(order.createdAt).toLocaleString('en-LK')}
                        </small>
                      </div>

                      {/* Status Dropdown & WhatsApp Action */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <select
                          className="bg-[#090B01] border border-[#2C3821] text-xs font-semibold text-white rounded-xl px-3 py-2 outline-none"
                          value={order.status}
                          onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                        >
                          {statusOptions.map(st => (
                            <option key={st} value={st}>{st.replace('_', ' ')}</option>
                          ))}
                        </select>

                        {cleanWhatsApp && (
                          <a
                            href={`https://wa.me/${cleanWhatsApp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline btn-sm text-xs"
                          >
                            <MessageCircle size={14} className="text-[#6C8C17]" />
                            Chat with Client
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Customer & Delivery Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs">
                      <div className="bg-[#090B01] p-3 rounded-xl border border-[#2C3821]">
                        <span className="text-[#A9ADA2] block mb-1">Customer:</span>
                        <strong className="text-white block text-sm">{order.customer.name}</strong>
                        <div className="text-[#DDE8CB] mt-0.5">{order.customer.phone}</div>
                        {order.customer.email && <div className="text-[#A9ADA2]">{order.customer.email}</div>}
                      </div>

                      <div className="bg-[#090B01] p-3 rounded-xl border border-[#2C3821]">
                        <span className="text-[#A9ADA2] block mb-1">Type &amp; Address:</span>
                        <div className="font-semibold text-white mb-0.5 flex items-center gap-1.5">
                          {order.customer.orderType === 'pickup' ? (
                            <><Store size={14} className="text-[#6C8C17]" /> Self Pickup</>
                          ) : (
                            <><Truck size={14} className="text-[#6C8C17]" /> Delivery</>
                          )}
                        </div>
                        <div className="text-white break-words">{order.customer.address}</div>
                        {order.customer.deliveryTime && (
                          <div className="text-[#D8BE8C] mt-1">Slot: {order.customer.deliveryTime}</div>
                        )}
                      </div>

                      <div className="bg-[#090B01] p-3 rounded-xl border border-[#2C3821]">
                        <span className="text-[#A9ADA2] block mb-1">Financials:</span>
                        <div className="flex justify-between mb-1">
                          <span>Subtotal:</span>
                          <strong className="text-white">{money(order.subtotal)}</strong>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span>Delivery:</span>
                          <strong className="text-white">{money(order.deliveryFee)}</strong>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-[#2C3821] font-bold text-sm text-[#6C8C17]">
                          <span>Total:</span>
                          <span>{money(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-[#090B01] p-3.5 rounded-xl border border-[#2C3821]">
                      <span className="text-[11px] font-bold text-[#A9ADA2] uppercase tracking-wider block mb-2">
                        Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)} meals)
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded bg-[#141A0D] border border-[#2C3821]">
                            <div>
                              <strong className="text-white">{item.quantity} × {item.name}</strong>
                              <small className="block text-[#A9ADA2] text-[10px]">Date: {item.deliveryDate}</small>
                            </div>
                            <span className="font-semibold text-[#DDE8CB]">{money(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-2.5 pt-2 border-t border-[#2C3821] text-xs text-[#D8BE8C]">
                          <strong>Special Instructions:</strong> {order.notes}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 5: BUSINESS SETTINGS */}
      {activeTab === 'team' && admin?.role === 'superadmin' && (
        <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="eyebrow">SUPER ADMIN ONLY</span>
              <h2 className="text-xl font-bold mb-1">Administrator approvals</h2>
              <p className="text-sm text-[#A9ADA2]">
                Review staff access before they can enter the operations dashboard.
              </p>
            </div>
            <ShieldCheck size={28} className="text-[#6C8C17]" />
          </div>
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-sm text-[#A9ADA2] py-6 text-center">No administrator accounts found.</p>
            ) : admins.map((teamAdmin) => (
              <div key={teamAdmin._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090B01] border border-[#2C3821] rounded-xl p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{teamAdmin.name}</strong>
                    <span className={`badge-tag ${teamAdmin.status === 'pending' ? 'text-[#D8BE8C]' : ''}`}>
                      {teamAdmin.status || 'active'}
                    </span>
                    {teamAdmin.role === 'superadmin' && <span className="text-[10px] text-[#6C8C17] uppercase font-bold">Owner</span>}
                  </div>
                  <p className="text-xs text-[#A9ADA2] mt-1">{teamAdmin.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {teamAdmin.status === 'pending' && (
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleApproveAdmin(teamAdmin._id)}>
                      <CheckCircle2 size={14} /> Approve
                    </button>
                  )}
                  {String(teamAdmin._id) !== String(admin?.id) && teamAdmin.role !== 'superadmin' && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={async () => {
                      if (!window.confirm(`Remove ${teamAdmin.name}'s administrator access?`)) return;
                      try {
                        await del(`/admin/admins/${teamAdmin._id}`);
                        await refreshData();
                        showNotification('Administrator removed.');
                      } catch (err) {
                        setError(err.message || 'Could not remove administrator.');
                      }
                    }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && admin?.role === 'superadmin' && (
        <div className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <span className="eyebrow">SUPER ADMIN ONLY</span>
              <h2 className="text-xl font-bold mb-1">Registered customers</h2>
              <p className="text-sm text-[#A9ADA2]">
                Remove customer accounts while preserving their order history.
              </p>
            </div>
            <ShieldCheck size={28} className="text-[#6C8C17]" />
          </div>
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-[#A9ADA2] py-6 text-center">No registered customers found.</p>
            ) : users.map((user) => (
              <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090B01] border border-[#2C3821] rounded-xl p-4">
                <div>
                  <strong className="text-white">{user.name}</strong>
                  <p className="text-xs text-[#A9ADA2] mt-1">{user.email}</p>
                  <p className="text-xs text-[#A9ADA2] mt-1">{user.phone}</p>
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveUser(user)}>
                  <Trash2 size={14} /> Remove Customer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BUSINESS SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-[#1A2110] border border-[#2C3821] rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-2">Business Settings</h2>
          <p className="text-xs text-[#A9ADA2] mb-6">
            Centralized settings applied across the customer website, footer, checkout calculations, and WhatsApp ordering link.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="form-group mb-0">
              <label>Business Name *</label>
              <input
                type="text"
                className="form-control"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                required
              />
            </div>

            <div className="form-group mb-0">
              <label>Tagline</label>
              <input
                type="text"
                className="form-control"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label>Official Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label>Public Phone *</label>
                <input
                  type="tel"
                  className="form-control"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label>Receiving WhatsApp Number (e.g. 94712599785) *</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-0">
                <label>Flat Delivery Fee (LKR) *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={settings.deliveryFee}
                  onChange={(e) => setSettings({ ...settings, deliveryFee: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label>Pickup Hub Location Address</label>
              <input
                type="text"
                className="form-control"
                value={settings.pickupLocation}
                onChange={(e) => setSettings({ ...settings, pickupLocation: e.target.value })}
              />
            </div>

            <div className="form-group mb-0">
              <label>Daily Ordering Cutoff Time</label>
              <input
                type="text"
                className="form-control"
                placeholder="8:00 PM"
                value={settings.cutoffTime}
                onChange={(e) => setSettings({ ...settings, cutoffTime: e.target.value })}
              />
            </div>

            <div className="form-group mb-0">
              <label>Order Through</label>
              <textarea
                className="form-control"
                rows={2}
                value={settings.orderThrough}
                onChange={(e) => setSettings({ ...settings, orderThrough: e.target.value })}
              />
            </div>

            <div className="form-group mb-0">
              <label>Free Delivery Areas</label>
              <textarea
                className="form-control"
                rows={2}
                value={settings.deliveryAreas}
                onChange={(e) => setSettings({ ...settings, deliveryAreas: e.target.value })}
              />
            </div>

            <div className="form-group mb-0">
              <label>Payment Method</label>
              <input
                type="text"
                className="form-control"
                value={settings.paymentMethod}
                onChange={(e) => setSettings({ ...settings, paymentMethod: e.target.value })}
              />
            </div>

            <div className="form-group mb-0">
              <label>Business Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg mt-4">
              Save Business Settings
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
