import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'healyBiteCartV2';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  function addItem(meal, deliveryDate, quantity = 1) {
    const mealId = meal._id;
    const key = `${mealId}:${deliveryDate}`;
    const qty = Math.max(1, Math.min(20, quantity));

    setItems(current => {
      const existing = current.find(item => item.key === key);
      if (existing) {
        return current.map(item =>
          item.key === key
            ? { ...item, quantity: Math.min(item.quantity + qty, 20) }
            : item
        );
      }
      return [
        ...current,
        {
          key,
          mealId,
          name: meal.name,
          price: meal.price,
          imageUrl: meal.imageUrl || '',
          icon: meal.icon || '🥗',
          deliveryDate,
          quantity: qty,
          calories: meal.calories,
          protein: meal.protein
        }
      ];
    });

    showToast(`Added ${qty}× ${meal.name} to cart`);
  }

  function updateQuantity(key, quantity) {
    setItems(current =>
      current
        .map(item =>
          item.key === key
            ? { ...item, quantity: Math.max(0, Math.min(20, quantity)) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function removeItem(key) {
    setItems(current => current.filter(item => item.key !== key));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      itemCount,
      subtotal,
      toast,
      showToast
    }),
    [items, itemCount, subtotal, toast]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div className="toast-pill">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6C8C17] animate-ping" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
