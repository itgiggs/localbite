'use client';

import { ShoppingBag, Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDropdown({ onClose }: { onClose: () => void }) {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-3 w-80 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden text-left">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900">Your Cart</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-4 text-center text-sm font-semibold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-your-orange/10 hover:bg-your-orange/20 text-your-orange transition-colors"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-300 hover:text-spicy shrink-0 transition-colors"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">Subtotal</span>
              <span className="text-sm font-bold text-your-orange">${subtotal.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
