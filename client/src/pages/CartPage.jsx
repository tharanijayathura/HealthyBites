import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, Trash2, ShoppingBag, Calendar, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dates';
import { money } from '../utils/money';

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, itemCount, subtotal } = useCart();
  const { user } = useAuth();

  // Group items by delivery date
  const groupedItems = items.reduce((groups, item) => {
    const date = item.deliveryDate;
    if (!groups[date]) groups[date] = [];
    groups[date].push(item);
    return groups;
  }, {});

  const dates = Object.keys(groupedItems).sort();

  return (
    <main className="container section-py">
      {/* Header */}
      <div className="section-header flex items-center justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">
            <ShoppingBag size={16} /> YOUR HEALY BITE ORDER
          </span>
          <h1>
            Shopping <span className="brand-leaf">Cart.</span>
          </h1>
          <p>
            {itemCount} nutritious gym meal{itemCount === 1 ? '' : 's'} across {dates.length} scheduled delivery date{dates.length === 1 ? '' : 's'}.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            className="text-xs text-[#A9ADA2] hover:text-[#FFB3A8] transition-colors flex items-center gap-1.5"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all items in your cart?')) {
                clearCart();
              }
            }}
          >
            <Trash2 size={14} /> Clear entire cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state py-24">
          <div className="w-16 h-16 rounded-full bg-[#1A2110] border border-[#2C3821] flex items-center justify-center text-[#6C8C17] mb-4">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Your cart is currently empty</h2>
          <p className="text-sm text-[#A9ADA2] max-w-md mb-6">
            Fuel your workout days with fresh chef-prepared meals. Explore our weekly rotating menu and add your favorite meals.
          </p>
          <Link to="/menu" className="btn btn-primary btn-lg">
            Explore Weekly Menu <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="checkout-layout-grid">
          {/* Items Column Grouped By Delivery Date */}
          <div className="space-y-6">
            {dates.map(date => (
              <div
                key={date}
                className="bg-[#1A2110] border border-[#2C3821] rounded-2xl p-6 overflow-hidden"
              >
                {/* Date Group Heading */}
                <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#2C3821] text-[#DDE8CB]">
                  <Calendar size={18} className="text-[#6C8C17]" />
                  <h3 className="text-base font-bold m-0">
                    Delivery scheduled for: {formatDate(date)}
                  </h3>
                </div>

                <div className="space-y-4">
                  {groupedItems[date].map(item => (
                    <article
                      key={item.key}
                      className="cart-item-row flex items-center gap-4 py-3 border-b border-[#2C3821]/60 last:border-b-0"
                    >
                      {/* Image / Thumbnail */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#090B01] border border-[#2C3821] shrink-0">
                        <img
                          src={item.imageUrl || '/images/food/1.png'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/images/food/1.png'; }}
                        />
                      </div>

                      {/* Details */}
                      <div className="cart-item-details flex-1 min-w-0">
                        <h4 className="text-sm md:text-base font-bold text-white mb-1 truncate">
                          {item.name}
                        </h4>
                        <div className="text-xs text-[#A9ADA2] mb-1">
                          Unit Price: <strong>{money(item.price)}</strong>
                        </div>
                        {item.protein && (
                          <div className="text-[11px] text-[#6C8C17] font-semibold">
                            {item.protein}g Protein · {item.calories || 0} kcal
                          </div>
                        )}
                      </div>

                      {/* Quantity & Controls */}
                      <div className="cart-item-controls flex flex-col items-end gap-2">
                        <strong className="text-sm md:text-base text-[#DDE8CB]">
                          {money(item.price * item.quantity)}
                        </strong>

                        <div className="flex items-center gap-2 bg-[#090B01] border border-[#2C3821] rounded-lg p-1">
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-[#1A2110]"
                            onClick={() => updateQuantity(item.key, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-bold w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-white hover:bg-[#1A2110]"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            disabled={item.quantity >= 20}
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-[11px] text-[#A9ADA2] hover:text-[#FFB3A8] transition-colors flex items-center gap-1"
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Link to="/menu" className="btn btn-outline btn-sm">
                <ArrowLeft size={15} /> Add more meals
              </Link>
            </div>
          </div>

          {/* Sticky Summary Card */}
          <aside className="summary-box sticky top-28">
            <h3 className="text-xl font-bold mb-5 pb-3 border-b border-[#2C3821]">
              Order Summary
            </h3>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-[#A9ADA2]">
                <span>Total Items</span>
                <strong className="text-white">{itemCount} meals</strong>
              </div>
              <div className="flex justify-between text-[#A9ADA2]">
                <span>Subtotal</span>
                <strong className="text-white">{money(subtotal)}</strong>
              </div>
              <div className="flex justify-between text-[#A9ADA2]">
                <span>Estimated Delivery</span>
                <span className="text-xs text-[#DDE8CB]">Calculated at checkout</span>
              </div>
              <div className="pt-3 border-t border-[#2C3821] flex justify-between items-baseline">
                <span className="font-bold text-base text-white">Estimated Subtotal</span>
                <strong className="text-2xl font-bold brand-leaf">
                  {money(subtotal)}
                </strong>
              </div>
            </div>

            <div className="bg-[#090B01] border border-[#2C3821] rounded-xl p-3.5 mb-6 text-xs text-[#A9ADA2] flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-[#6C8C17] shrink-0 mt-0.5" />
              <span>
                All meals are prepared fresh on your selected delivery dates. Final confirmation occurs directly on WhatsApp.
              </span>
            </div>

            {user ? (
              <Link to="/checkout" className="btn btn-primary btn-lg btn-block mb-3">
                Proceed to Checkout <ArrowRight size={18} />
              </Link>
            ) : (
              <div className="space-y-2 mb-3">
                <Link
                  to="/login"
                  state={{ from: '/checkout', message: 'Please sign in to your Healy Bite account to place your order.' }}
                  className="btn btn-primary btn-lg btn-block"
                >
                  <ShoppingBag size={17} /> Sign In to Order
                </Link>
                <p className="text-[11px] text-[#A9ADA2] text-center">
                  Only signed-in members can complete checkout.
                </p>
              </div>
            )}

            <Link to="/menu" className="block text-center text-xs text-[#A9ADA2] hover:text-[#DDE8CB]">
              Continue Browsing Menu
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
