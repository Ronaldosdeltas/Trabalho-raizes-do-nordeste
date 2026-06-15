import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, Coupon, Order, PaymentMethod } from '../types';
import { coupons } from '../data/coupons';
import { orderService } from '../services/orderService';
import { loyaltyService } from '../services/loyaltyService';
import { productService } from '../services/productService';
import { useAuth } from './AuthContext';

function storageKey(userId: string | null): string {
  return userId ? `rnordeste_cart_${userId}` : 'rnordeste_cart_guest';
}

interface PersistedCart {
  items: CartItem[];
  cartUnitId: string | null;
  currentUnitId: string | null;
  appliedCoupon: Coupon | null;
}

function loadCart(userId: string | null): PersistedCart {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw) return JSON.parse(raw) as PersistedCart;
  } catch { /* ignore */ }
  return { items: [], cartUnitId: null, currentUnitId: null, appliedCoupon: null };
}

function saveCart(userId: string | null, data: PersistedCart) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(data));
  } catch { /* ignore */ }
}

interface CartContextType {
  items: CartItem[];
  currentUnitId: string | null;
  cartUnitId: string | null;
  setCurrentUnit: (unitId: string | null) => void;
  addToCart: (product: Product) => { success: boolean; conflict?: boolean };
  clearCartAndAdd: (product: Product) => void;
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
  checkout: (userId: string, paymentMethod?: PaymentMethod) => { success: boolean; orderId?: string };
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentUser, isLoading } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(null);
  const [cartUnitId, setCartUnitId] = useState<string | null>(null);
  // undefined = not yet initialized (auth still loading)
  const [activeUserId, setActiveUserId] = useState<string | null | undefined>(undefined);

  // Reload cart whenever the authenticated user changes
  useEffect(() => {
    if (isLoading) return;
    const userId = currentUser?.userId ?? null;
    if (userId === activeUserId) return;
    const saved = loadCart(userId);
    setItems(saved.items);
    setAppliedCoupon(saved.appliedCoupon);
    setCurrentUnitId(saved.currentUnitId);
    setCartUnitId(saved.cartUnitId);
    setActiveUserId(userId);
  }, [currentUser?.userId, isLoading]);

  // Persist cart changes (only after initialization)
  useEffect(() => {
    if (activeUserId === undefined) return;
    saveCart(activeUserId, { items, cartUnitId, currentUnitId, appliedCoupon });
  }, [items, cartUnitId, currentUnitId, appliedCoupon, activeUserId]);

  const setCurrentUnit = (unitId: string | null) => setCurrentUnitId(unitId);

  const addToCart = (product: Product): { success: boolean; conflict?: boolean } => {
    if (items.length > 0 && currentUnitId !== null && cartUnitId !== null && currentUnitId !== cartUnitId) {
      return { success: false, conflict: true };
    }
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
    if (items.length === 0 && currentUnitId !== null) {
      setCartUnitId(currentUnitId);
    }
    return { success: true };
  };

  const clearCartAndAdd = (product: Product) => {
    setItems([{ product, quantity: 1 }]);
    setAppliedCoupon(null);
    setCartUnitId(currentUnitId);
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
    setCartUnitId(null);
    try { localStorage.removeItem(storageKey(activeUserId ?? null)); } catch { /* ignore */ }
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
    const trimmed = code.trim().toUpperCase();

    const staticCoupon = coupons.find(c => c.code.toUpperCase() === trimmed);
    if (staticCoupon) {
      if (staticCoupon.minOrder && subtotal < staticCoupon.minOrder) {
        return {
          success: false,
          error: `Pedido mínimo de R$ ${staticCoupon.minOrder.toFixed(2).replace('.', ',')} para este cupom.`,
        };
      }
      setAppliedCoupon(staticCoupon);
      return { success: true };
    }

    const loyaltyCoupon = loyaltyService.getLoyaltyCouponByCode(trimmed);
    if (loyaltyCoupon) {
      if (loyaltyCoupon.usedAt) return { success: false, error: 'Este cupom já foi utilizado.' };
      if (new Date(loyaltyCoupon.expiresAt) < new Date()) {
        return { success: false, error: 'Cupom expirado.' };
      }
      if (loyaltyCoupon.minOrder && subtotal < loyaltyCoupon.minOrder) {
        return {
          success: false,
          error: `Pedido mínimo de R$ ${loyaltyCoupon.minOrder.toFixed(2).replace('.', ',')} para este cupom.`,
        };
      }
      setAppliedCoupon({
        code: loyaltyCoupon.code,
        type: loyaltyCoupon.type,
        value: loyaltyCoupon.value,
        description: loyaltyCoupon.description,
        minOrder: loyaltyCoupon.minOrder,
      });
      return { success: true };
    }

    return { success: false, error: 'Cupom inválido ou inexistente.' };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const validateCart = (): Product[] => {
    const current = productService.getProducts();
    return items
      .map(item => current.find(p => p.id === item.product.id))
      .filter((p): p is Product => p !== undefined && !p.available);
  };

  const checkout = (userId: string, paymentMethod?: PaymentMethod): { success: boolean; orderId?: string } => {
    if (items.length === 0) return { success: false };

    const order: Order = {
      id: crypto.randomUUID(),
      userId,
      unitId: currentUnitId ?? undefined,
      items: items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
      subtotal,
      discount,
      total,
      coupon: appliedCoupon ?? undefined,
      paymentMethod,
      status: 'Pedido recebido',
      createdAt: new Date().toISOString(),
    };

    orderService.createOrder(order);

    if (appliedCoupon) {
      loyaltyService.markLoyaltyCouponUsed(appliedCoupon.code);
    }

    loyaltyService.awardOrderPoints(userId, order.id, order.total);

    clearCart();
    return { success: true, orderId: order.id };
  };

  return (
    <CartContext.Provider
      value={{
        items, currentUnitId, cartUnitId, setCurrentUnit,
        addToCart, clearCartAndAdd, addMultipleToCart, removeFromCart, updateQuantity, clearCart,
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
