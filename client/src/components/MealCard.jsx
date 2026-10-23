import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Eye, Flame, Dumbbell, Lock } from 'lucide-react';
import { money } from '../utils/money';
import { formatDate } from '../utils/dates';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MealDetailModal from './MealDetailModal';

export default function MealCard({ meal, deliveryDate }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (meal.isSoldOut) return;

    // Only logged-in users can order food
    if (!user) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          message: 'Please sign in to your Healy Bite account to add meals and place your order.'
        }
      });
      return;
    }

    addItem(meal, deliveryDate);
  };

  return (
    <>
      <article className="meal-card-premium" onClick={() => setModalOpen(true)}>
        {/* Visual Thumbnail */}
        <div className="meal-thumb-wrap">
          <img
            src={meal.imageUrl || '/images/food/1.png'}
            alt={meal.name}
            loading="lazy"
            onError={(e) => { e.target.src = '/images/food/1.png'; }}
          />

          {meal.category && (
            <span className="meal-category-pill">{meal.category}</span>
          )}

          {meal.isSoldOut && (
            <span className="meal-sold-out-badge">SOLD OUT</span>
          )}
        </div>

        {/* Card Content */}
        <div className="meal-card-body">
          <h3>{meal.name}</h3>
          <p className="meal-desc">
            {meal.description || 'Nutrient-rich, chef-crafted fitness meal.'}
          </p>

          {/* Macros Bar */}
          <div className="macros-bar">
            <div className="macro-stat highlight">
              <span>Protein</span>
              <strong>{meal.protein != null ? `${meal.protein}g` : '—'}</strong>
            </div>
            <div className="macro-stat">
              <span>Calories</span>
              <strong>{meal.calories != null ? `${meal.calories} kcal` : '—'}</strong>
            </div>
            <div className="macro-stat">
              <span>Carbs</span>
              <strong>{meal.carbs != null ? `${meal.carbs}g` : '—'}</strong>
            </div>
          </div>

          {/* Card Footer */}
          <div className="meal-footer-row">
            <div className="meal-price-box">
              <strong>{money(meal.price)}</strong>
              {deliveryDate && <small>For {formatDate(deliveryDate)}</small>}
            </div>

            <div className="meal-card-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                title="View meal details"
                aria-label={`View details for ${meal.name}`}
              >
                <Eye size={15} />
              </button>

              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAdd}
                disabled={meal.isSoldOut}
                aria-label={`Add ${meal.name} to cart`}
                title={!user ? 'Sign in to order' : `Add ${meal.name}`}
              >
                {!user ? (
                  <>
                    <Lock size={14} />
                    <span>Order</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>{meal.isSoldOut ? 'Sold Out' : 'Add'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Detail Modal */}
      {modalOpen && (
        <MealDetailModal
          meal={meal}
          deliveryDate={deliveryDate}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
