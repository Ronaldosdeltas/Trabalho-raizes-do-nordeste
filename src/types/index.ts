export type Category = 'Comidas Típicas' | 'Bebidas Regionais' | 'Doces';

export type PaymentMethod = 'dinheiro' | 'credito' | 'debito' | 'pix' | 'raizes_card';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  lgpdConsent: boolean;
  birthDate?: string; // YYYY-MM-DD
}

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
}

export interface SeasonalInfo {
  start: string;  // "MM-DD"
  end: string;    // "MM-DD"
  tag: string;    // "Edição Junina"
  tagColor: string; // Tailwind bg class
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  emoji: string;
  bgColor: string;
  featured: boolean;
  description: string;
  ingredients: string[];
  available: boolean;
  seasonal?: SeasonalInfo;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UnitProduct {
  productId: number;
  available: boolean;
}

export interface Unit {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  emoji: string;
  bgColor: string;
  products: UnitProduct[];
  paymentMethods: PaymentMethod[];
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  minOrder?: number;
}

export type OrderStatus =
  | 'Pedido recebido'
  | 'Em preparo'
  | 'Pronto para retirada'
  | 'Retirado'
  | 'Cancelado';

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  unitId?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon?: Coupon;
  paymentMethod?: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager';
  unitId?: string;
}

export interface AdminSession {
  adminId: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  unitId?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  productId: number;
  orderId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export type LoyaltyLevel = 'Bronze' | 'Prata' | 'Ouro';

export type PointsTransactionType = 'earned' | 'redeemed' | 'bonus';

export interface PointsTransaction {
  id: string;
  type: PointsTransactionType;
  points: number;
  description: string;
  createdAt: string;
  expiresAt?: string;
  orderId?: string;
}

export interface LoyaltyProfile {
  userId: string;
  balance: number;
  lifetimePoints: number;
  transactions: PointsTransaction[];
  lastBirthdayBonusYear: number | null;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'freeProduct' | 'freeShipping';
  value?: number;
  emoji: string;
}

export interface LoyaltyCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  minOrder?: number;
  userId: string;
  expiresAt: string;
  usedAt?: string;
}
