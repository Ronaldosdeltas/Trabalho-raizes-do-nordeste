import type { Order, OrderStatus } from '../types';

const ORDERS_KEY = 'raizes_orders';

export const orderService = {
  getOrders(): Order[] {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? (JSON.parse(data) as Order[]) : [];
  },

  getAllOrders(): Order[] {
    return this.getOrders().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  getUserOrders(userId: string): Order[] {
    return this.getOrders()
      .filter(o => o.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getOrderById(orderId: string): Order | undefined {
    return this.getOrders().find(o => o.id === orderId);
  },

  createOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  updateStatus(orderId: string, status: OrderStatus): boolean {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    orders[idx] = { ...orders[idx], status };
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return true;
  },
};
