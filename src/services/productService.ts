import type { Product } from '../types';
import { products as defaultProducts } from '../data/products';

const KEY = 'raizes_products';
const SEEDED = 'raizes_products_seeded';

export const productService = {
  ensureSeeded(): void {
    if (localStorage.getItem(SEEDED)) return;
    localStorage.setItem(KEY, JSON.stringify(defaultProducts));
    localStorage.setItem(SEEDED, '1');
  },

  getProducts(): Product[] {
    this.ensureSeeded();
    const data = localStorage.getItem(KEY);
    return data ? (JSON.parse(data) as Product[]) : defaultProducts;
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEY, JSON.stringify(products));
  },

  addProduct(data: Omit<Product, 'id'>): Product {
    const all = this.getProducts();
    const newId = all.reduce((max, p) => Math.max(max, p.id), 0) + 1;
    const product: Product = { ...data, id: newId };
    this.saveProducts([...all, product]);
    return product;
  },

  updateProduct(updated: Product): void {
    this.saveProducts(this.getProducts().map(p => (p.id === updated.id ? updated : p)));
  },

  deleteProduct(id: number): void {
    this.saveProducts(this.getProducts().filter(p => p.id !== id));
  },

  getById(id: number): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  },
};
