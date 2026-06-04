export type Category = 'Comidas Típicas' | 'Bebidas Regionais' | 'Doces';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  lgpdConsent: boolean;
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
  | 'Em entrega'
  | 'Entregue'
  | 'Cancelado';

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  coupon?: Coupon;
  status: OrderStatus;
  createdAt: string;
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
