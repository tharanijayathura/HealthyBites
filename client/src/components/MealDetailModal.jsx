import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Flame, Dumbbell, Wheat, Droplet, AlertCircle, Check } from 'lucide-react';
import { money } from '../utils/money';
import { formatDate } from '../utils/dates';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function MealDetailModal({ meal, deliveryDate, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!meal) return null;

  const handleAddToCart = () => {
    if (meal.isSoldOut) return;

    // Only logged-in users can order food
    if (!user) {
      onClose();
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          message: 'Please sign in to your Healy Bite account to add meals and place your order.'
        }
      });
      return;
    }

    addItem(meal, deliveryDate, quantity);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close meal details">
          <X size={20} />
        </button>

        <div className="modal-grid">
          {/* Image Column */}
          <div className="modal-image-col">
            <img
              src={meal.imageUrl || '/images/food/1.png'}
              alt={meal.name}
              onError={(e) => { e.target.src = '/images/food/1.png'; }}
            />
            {meal.category && (
              <span className="meal-category-pill">{meal.category}</span>
            )}
            {meal.isSoldOut && (
              <span className="meal-sold-out-badge">SOLD OUT</span>
            )}
          </div>

          {/* Details Column */}
          <div className="modal-content-col">
            <span className="eyebrow">
              {deliveryDate ? `Scheduled for ${formatDate(deliveryDate)}` : 'Weekly Gym Fuel'}
            </span>
            <h2 className="text-2xl font-bold mb-2">{meal.name}</h2>
            <div className="text-2xl font-bold brand-leaf mb-3">
              {money(meal.price)}
            </div>

            <p className="text-sm text-[#A9ADA2] leading-relaxed mb-4">
              {meal.description || 'Crafted with premium whole ingredients to fuel your fitness regimen.'}
            </p>

            {/* Macro Breakdown Grid */}
            <div className="bg-[#090B01] border border-[#2C3821] rounded-xl p-3 mb-4">
              <h4 className="text-xs font-bold text-[#DDE8CB] uppercase tracking-wider mb-2">
                Nutritional Profile (Per Serving)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[#141A0D]">
                  <div className="flex items-center justify-center gap-1 text-[#D8BE8C] text-xs mb-1">
                    <Flame size={13} />
                    <span>Cal</span>
                  </div>
                  <strong className="text-sm text-white font-bold">
                    {meal.calories != null ? `${meal.calories}` : '—'}
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-[#141A0D] border border-[#6C8C17]/30">
                  <div className="flex items-center justify-center gap-1 text-[#6C8C17] text-xs mb-1">
                    <Dumbbell size={13} />
                    <span>Protein</span>
                  </div>
                  <strong className="text-sm text-[#DDE8CB] font-bold">
                    {meal.protein != null ? `${meal.protein}g` : '—'}
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-[#141A0D]">
                  <div className="flex items-center justify-center gap-1 text-[#A9ADA2] text-xs mb-1">
                    <Wheat size={13} />
                    <span>Carbs</span>
                  </div>
                  <strong className="text-sm text-white font-bold">
                    {meal.carbs != null ? `${meal.carbs}g` : '—'}
                  </strong>
                </div>

                <div className="p-2 rounded-lg bg-[#141A0D]">
                  <div className="flex items-center justify-center gap-1 text-[#A9ADA2] text-xs mb-1">
                    <Droplet size={13} />
                    <span>Fats</span>
                  </div>
                  <strong className="text-sm text-white font-bold">
                    {meal.fat != null ? `${meal.fat}g` : '—'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-[#A9ADA2] uppercase tracking-wider">
                  Key Ingredients
                </h4>
                <div className="ingredients-chips">
                  {meal.ingredients.map((ing, idx) => (
                    <span key={idx} className="chip">{ing}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens Notice */}
            {meal.allergens && meal.allergens.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-[#D8BE8C] bg-[#231E12] border border-[#483B1F] p-2.5 rounded-lg mb-4">
                <AlertCircle size={15} className="shrink-0" />
                <span>Contains allergens: <strong>{meal.allergens.join(', ')}</strong></span>
              </div>
            )}

            {/* Order Controls */}
            <div className="mt-auto pt-3 border-t border-[#2C3821] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 bg-[#090B01] border border-[#2C3821] rounded-xl p-1.5">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-[#1A2110] text-white flex items-center justify-center hover:bg-[#2C3821]"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || meal.isSoldOut}
                >
                  <Minus size={15} />
                </button>
                <span className="font-bold w-6 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg bg-[#1A2110] text-white flex items-center justify-center hover:bg-[#2C3821]"
                  onClick={() => setQuantity(q => Math.min(20, q + 1))}
                  disabled={quantity >= 20 || meal.isSoldOut}
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                type="button"
                className={`btn flex-1 ${added ? 'bg-[#3C7100] text-white' : 'btn-primary'}`}
                onClick={handleAddToCart}
                disabled={meal.isSoldOut}
              >
                {added ? (
                  <>
                    <Check size={18} /> Added to Cart!
                  </>
                ) : meal.isSoldOut ? (
                  'Sold Out'
                ) : !user ? (
                  <>
                    <ShoppingBag size={17} /> Sign In to Order ({money(meal.price * quantity)})
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Add ({money(meal.price * quantity)})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
