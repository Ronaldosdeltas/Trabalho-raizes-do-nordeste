import type { Unit } from '../types';
import { units as defaultUnits } from '../data/units';

const KEY = 'raizes_units';
const SEEDED = 'raizes_units_seeded';

export const unitService = {
  ensureSeeded(): void {
    if (localStorage.getItem(SEEDED)) return;
    localStorage.setItem(KEY, JSON.stringify(defaultUnits));
    localStorage.setItem(SEEDED, '1');
  },

  getUnits(): Unit[] {
    this.ensureSeeded();
    const data = localStorage.getItem(KEY);
    return data ? (JSON.parse(data) as Unit[]) : defaultUnits;
  },

  saveUnits(units: Unit[]): void {
    localStorage.setItem(KEY, JSON.stringify(units));
  },

  getUnit(id: string): Unit | undefined {
    return this.getUnits().find(u => u.id === id);
  },

  setProductAvailability(unitId: string, productId: number, available: boolean): void {
    this.saveUnits(
      this.getUnits().map(u => {
        if (u.id !== unitId) return u;
        const hasEntry = u.products.some(up => up.productId === productId);
        return {
          ...u,
          products: hasEntry
            ? u.products.map(up => (up.productId === productId ? { ...up, available } : up))
            : [...u.products, { productId, available }],
        };
      }),
    );
  },

  addProductToUnit(unitId: string, productId: number): void {
    this.setProductAvailability(unitId, productId, true);
  },

  removeProductFromUnit(unitId: string, productId: number): void {
    this.saveUnits(
      this.getUnits().map(u => {
        if (u.id !== unitId) return u;
        return { ...u, products: u.products.filter(up => up.productId !== productId) };
      }),
    );
  },
};
