import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  ArrowLeft,
  Truck,
  Store,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { get, post } from '../api/client';
import { formatDate, todayInColombo } from '../utils/dates';
import { money } from '../utils/money';

const DELIVERY_TIMES = [
  'Morning Slot (8:00 AM – 10:30 AM)',
  'Lunch Slot (11:30 AM – 1:30 PM)',
  'Evening Slot (5:30 PM – 7:30 PM)'
];

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    orderType: 'delivery',
    deliveryTime: DELIVERY_TIMES[1]
  });

  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [notes, setNotes] = useState('');
  const [settings, setSettings] = useState({
    deliveryFee: 250,
    pickupLocation: 'Healy Bite Hub, Colombo 03, Sri Lanka',
    deliveryEnabled: true,
    pickupEnabled: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    get('/settings')
      .then(data => {
        setSettings({
          deliveryFee: data.deliveryFee ?? 250,
          pickupLocation: data.pickupLocation || 'Healy Bite Hub, Colombo 03, Sri Lanka',
          deliveryEnabled: data.deliveryEnabled ?? true,
          pickupEnabled: data.pickupEnabled ?? true
        });
      })
      .catch(() => {});
  }, []);

  const hasPastDates = items.some(item => item.deliveryDate < todayInColombo());

  const currentDeliveryFee = customer.orderType === 'pickup' ? 0 : (settings.deliveryFee || 0);
  const grandTotal = subtotal + currentDeliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    if (hasPastDates) {
      setError('One of your delivery dates has passed. Please return to your cart and update the date.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          whatsappNumber: sameAsPhone ? customer.phone.trim() : (customer.whatsappNumber.trim() || customer.phone.trim()),
          email: customer.email.trim(),
          orderType: customer.orderType,
          address: customer.orderType === 'pickup' ? settings.pickupLocation : customer.address.trim(),
          deliveryTime: customer.deliveryTime
        },
        items: items.map(item => ({
          mealId: item.mealId,
          quantity: item.quantity,
          deliveryDate: item.deliveryDate
        })),
        notes: notes.trim()
      };

      const response = await post('/orders', payload);
      setOrderResult(response);

      // Attempt opening WhatsApp in a new tab
      if (response?.whatsappUrl) {
        window.open(response.whatsappUrl, '_blank', 'noopener,noreferrer');
      }

      // Clear the browser cart after order is successfully recorded
      clearCart();
    } catch (err) {
      setError(err.message || 'Could not prepare your order. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. SUCCESS / WHATSAPP HANDOFF SCREEN
  if (orderResult) {
    return (
      <main className="container section-py">
        <div className="max-w-2xl mx-auto bg-[#1A2110] border border-[#6C8C17] rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#111A0B] border-2 border-[#6C8C17] flex items-center justify-center text-[#6C8C17] mx-auto mb-6">
            <MessageCircle size={38} />
          </div>

          <span className="eyebrow mb-2">ORDER DRAFT CREATED</span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Order Reference: <span className="brand-leaf">{orderResult.orderCode}</span>
          </h1>

          <div className="bg-[#090B01] border border-[#2C3821] rounded-2xl p-5 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between text-[#A9ADA2]">
              <span>Order Status:</span>
              <span className="text-[#D8BE8C] font-semibold uppercase tracking-wider">
                Pending WhatsApp Handoff
              </span>
            </div>
            <div className="flex justify-between text-[#A9ADA2]">
              <span>Total Payable:</span>
              <strong className="text-white text-base">{money(orderResult.total)}</strong>
            </div>
          </div>

          <div className="bg-[#263117] border border-[#657539] rounded-2xl p-5 mb-8 text-left text-sm text-[#DDE8CB] leading-relaxed">
            <h4 className="font-bold text-white flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-[#6C8C17]" />
              Important Final Step:
            </h4>
            <p className="mb-2">
              Your order has been recorded in our system as <strong>Pending</strong>, but WhatsApp requires you to manually press <strong>Send</strong> in the chat to dispatch your request to Healy Bite.
            </p>
            <p className="text-xs text-[#A9ADA2]">
              Our kitchen team will verify portion availability and confirm your order directly on WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <a
              href={orderResult.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg w-full sm:w-auto"
            >
              <MessageCircle size={20} /> Open WhatsApp &amp; Send Message
            </a>

            <a
              href={orderResult.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-lg w-full sm:w-auto text-xs"
            >
              <RotateCcw size={16} /> Reopen WhatsApp
            </a>
          </div>

          <Link to="/" className="text-sm text-[#A9ADA2] hover:text-[#DDE8CB]">
            Return to Homepage
          </Link>
        </div>
      </main>
    );
  }

  // 2. EMPTY CART STATE
  if (items.length === 0) {
    return (
      <main className="container section-py">
        <div className="empty-state py-24">
          <h2 className="text-2xl font-bold mb-2">No meals in your cart to checkout</h2>
          <p className="text-sm text-[#A9ADA2] mb-6">
            Please add at least one meal from the menu before proceeding to checkout.
          </p>
          <Link to="/menu" className="btn btn-primary">
            Browse Weekly Menu
          </Link>
        </div>
      </main>
    );
  }

  // 3. CHECKOUT FORM & SUMMARY
  return (
    <main className="container section-py">
      {/* Header */}
      <div className="section-header">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs text-[#6C8C17] hover:underline mb-3">
          <ArrowLeft size={14} /> Back to cart
        </Link>
        <span className="eyebrow block">
          <ShieldCheck size={16} /> SECURE WHATSAPP ORDERING
        </span>
        <h1>
          Complete your <span className="brand-leaf">Order.</span>
        </h1>
        <p>
          Provide your delivery or pickup details. Your order request will be sent directly to Healy Bite on WhatsApp.
        </p>
      </div>

      <div className="checkout-layout-grid">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="form-panel">
          {/* Delivery or Pickup Toggle */}
          <div className="order-type-toggle">
            <button
              type="button"
              className={`order-type-btn ${customer.orderType === 'delivery' ? 'active' : ''}`}
              onClick={() => setCustomer({ ...customer, orderType: 'delivery' })}
            >
              <Truck size={17} /> Home / Gym Delivery
            </button>

            <button
              type="button"
              className={`order-type-btn ${customer.orderType === 'pickup' ? 'active' : ''}`}
              onClick={() => setCustomer({ ...customer, orderType: 'pickup' })}
            >
              <Store size={17} /> Hub Pickup (Free)
            </button>
          </div>

          <h3 className="text-lg font-bold mb-4 text-[#DDE8CB]">Customer Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Kasun Perera"
                value={customer.name}
                maxLength={100}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="0771234567"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                required
              />
            </div>
          </div>

          {/* WhatsApp Number (Optional if different) */}
          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label className="m-0">WhatsApp Number</label>
              <label className="text-xs text-[#A9ADA2] flex items-center gap-1.5 cursor-pointer m-0">
                <input
                  type="checkbox"
                  checked={sameAsPhone}
                  onChange={(e) => setSameAsPhone(e.target.checked)}
                />
                Same as contact phone
              </label>
            </div>
            {!sameAsPhone && (
              <input
                type="tel"
                className="form-control"
                placeholder="0712599785"
                value={customer.whatsappNumber}
                onChange={(e) => setCustomer({ ...customer, whatsappNumber: e.target.value })}
                required={!sameAsPhone}
              />
            )}
          </div>

          <div className="form-group">
            <label>Email Address (Optional)</label>
            <input
              type="email"
              className="form-control"
              placeholder="kasun@example.com"
              value={customer.email}
              maxLength={120}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
            />
          </div>

          {/* Delivery Details */}
          {customer.orderType === 'delivery' ? (
            <div className="form-group">
              <label>Delivery Address in Colombo *</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="e.g. No. 45, Duplication Road, Colombo 03 (Include gym name or apartment floor if applicable)"
                value={customer.address}
                maxLength={300}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                required
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#090B01] border border-[#2C3821] mb-5 text-xs text-[#A9ADA2]">
              <strong className="block text-[#DDE8CB] mb-1">Pickup Location:</strong>
              {settings.pickupLocation}
              <div className="mt-1 text-[#6C8C17]">Zero delivery fees apply.</div>
            </div>
          )}

          {/* Preferred Delivery Slot */}
          <div className="form-group">
            <label>Preferred Delivery Time Slot</label>
            <select
              className="form-control"
              value={customer.deliveryTime}
              onChange={(e) => setCustomer({ ...customer, deliveryTime: e.target.value })}
            >
              {DELIVERY_TIMES.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Special Instructions */}
          <div className="form-group">
            <label>Special Instructions / Diet Notes (Optional)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="e.g. Less sodium, dressing on the side, leave at reception desk..."
              value={notes}
              maxLength={400}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-[#371F1D] border border-[#8D4C46] text-[#FFC2B8] text-sm mb-5 flex items-center gap-2">
              <AlertCircle size={17} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={submitting || hasPastDates}
          >
            {submitting ? 'Validating Order...' : 'Place Order via WhatsApp'}
            <MessageCircle size={19} />
          </button>

          <p className="text-center text-xs text-[#A9ADA2] mt-3">
            Clicking will open WhatsApp with your itemized order details pre-filled. You must press Send to dispatch.
          </p>
        </form>

        {/* Summary Column */}
        <aside className="summary-box sticky top-28">
          <h3 className="text-xl font-bold mb-4 pb-3 border-b border-[#2C3821]">
            Order Review
          </h3>

          {/* Itemized List */}
          <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
            {items.map(item => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-3 text-xs border-b border-[#2C3821]/50 pb-3"
              >
                <div>
                  <strong className="block text-white text-sm">
                    {item.quantity} × {item.name}
                  </strong>
                  <span className="text-[#A9ADA2]">
                    Delivery: {formatDate(item.deliveryDate)}
                  </span>
                </div>
                <strong className="text-[#DDE8CB] text-sm">
                  {money(item.price * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div className="space-y-2.5 text-sm mb-6 pt-2 border-t border-[#2C3821]">
            <div className="flex justify-between text-[#A9ADA2]">
              <span>Meals Subtotal</span>
              <strong className="text-white">{money(subtotal)}</strong>
            </div>

            <div className="flex justify-between text-[#A9ADA2]">
              <span>Delivery Fee</span>
              <strong className="text-white">
                {currentDeliveryFee === 0 ? 'FREE' : money(currentDeliveryFee)}
              </strong>
            </div>

            <div className="pt-3 border-t border-[#2C3821] flex justify-between items-baseline">
              <span className="font-bold text-base text-white">Authoritative Total</span>
              <strong className="text-2xl font-bold brand-leaf">
                {money(grandTotal)}
              </strong>
            </div>
          </div>

          <div className="bg-[#090B01] border border-[#2C3821] rounded-xl p-3 text-xs text-[#A9ADA2] space-y-1">
            <div className="text-[#DDE8CB] font-semibold">Payment Method</div>
            <div>Cash on Delivery / Direct Bank Transfer confirmed via WhatsApp.</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
