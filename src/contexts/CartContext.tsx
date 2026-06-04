import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Product, CartItem, Coupon, Order } from '../types';
import { products as allProducts } from '../data/products';
import { coupons } from '../data/coupons';
import { orderService } from '../services/orderService';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  addMultipleToCart: (newItems: { product: Product; quantity: number }[]) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; error?: string };
  removeCoupon: () => void;
  validateCart: () => Product[];
  checkout: (userId: string) => { success: boolean; orderId?: string };
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const addMultipleToCart = (newItems: { product: Product; quantity: number }[]) => {
    setItems(prev => {
      const updated = [...prev];
      for (const { product, quantity } of newItems) {
        const idx = updated.findIndex(item => item.product.id === product.id);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        } else {
          updated.push({ product, quantity });
        }
      }
      return updated;
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setItems(prev =>
      prev
        .map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100;
    }
    return Math.min(appliedCoupon.value, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = Math.max(0, subtotal - discount);

  const applyCoupon = (code: string): { success: boolean; error?: string } => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) return { success: false, error: 'Cupom inválido ou inexistente.' };
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return {
        success: false,
        error: `Pedido mínimo de R$ ${coupon.minOrder.toFixed(2).replace('.', ',')} para este cupom.`,
      };
    }
    setAppliedCoupon(coupon);
    return { success: true };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  // Verifica disponibilidade atual dos produtos no carrinho
  const validateCart = (): Product[] => {
    return items
      .map(item => allProducts.find(p => p.id === item.product.id))
      .filter((p): p is Product => p !== undefined && !p.available);
  };

  const checkout = (userId: string): { success: boolean; orderId?: string } => {
    if (items.length === 0) return { success: false };

    const order: Order = {
      id: crypto.randomUUID(),
      userId,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      subtotal,
      discount,
      total,
      coupon: appliedCoupon ?? undefined,
      status: 'Pedido recebido',
      createdAt: new Date().toISOString(),
    };

    orderService.createOrder(order);
    clearCart();
    return { success: true, orderId: order.id };
  };

  return (
    <CartContext.Provider
      value={{
        items, addToCart, addMultipleToCart, removeFromCart, updateQuantity, clearCart,
        totalItems, subtotal, discount, total,
        appliedCoupon, applyCoupon, removeCoupon,
        validateCart, checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
