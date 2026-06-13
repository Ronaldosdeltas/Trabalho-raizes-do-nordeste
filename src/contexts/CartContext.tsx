import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, Coupon, Order, PaymentMethod } from '../types';
import { coupons } from '../data/coupons';
import { orderService } from '../services/orderService';
import { loyaltyService } from '../services/loyaltyService';
import { productService } from '../services/productService';

const STORAGE_KEY = 'rnordeste_cart';

interface PersistedCart {
  items: CartItem[];
  cartUnitId: string | null;
  currentUnitId: string | null;
  appliedCoupon: Coupon | null;
}

function loadCart(): PersistedCart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedCart;
  } catch { /* ignore */ }
  return { items: [], cartUnitId: null, currentUnitId: null, appliedCoupon: null };
}

function saveCart(data: PersistedCart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  const initial = loadCart();
  const [items, setItems] = useState<CartItem[]>(initial.items);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(initial.appliedCoupon);
  const [currentUnitId, setCurrentUnitId] = useState<string | null>(initial.currentUnitId);
  const [cartUnitId, setCartUnitId] = useState<string | null>(initial.cartUnitId);

  const setCurrentUnit = (unitId: string | null) => setCurrentUnitId(unitId);

  useEffect(() => {
    saveCart({ items, cartUnitId, currentUnitId, appliedCoupon });
  }, [items, cartUnitId, currentUnitId, appliedCoupon]);

  const addToCart = (product: Product): { success: boolean; conflict?: boolean } => {
    // Block mixing products from different units when both sides have a known unit
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
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
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

    // Check static coupons
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

    // Check loyalty coupons
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

  // Verifica disponibilidade atual dos produtos no carrinho
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

    // Mark loyalty coupon as used if applicable
    if (appliedCoupon) {
      loyaltyService.markLoyaltyCouponUsed(appliedCoupon.code);
    }

    // Award loyalty points for the order
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
