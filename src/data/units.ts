import type { Unit } from '../types';

export const units: Unit[] = [
  {
    id: 'fortaleza',
    name: 'Unidade Centro',
    city: 'Fortaleza',
    state: 'CE',
    address: 'Rua do Mercado, 142 – Centro',
    phone: '(85) 99999-0001',
    emoji: '🌊',
    bgColor: 'bg-blue-50',
    products: [
      { productId: 1, available: true },   // Carne de Sol
      { productId: 2, available: true },   // Baião de Dois
      { productId: 3, available: true },   // Tapioca
      { productId: 4, available: false },  // Buchada de Bode — esgotado
      { productId: 5, available: true },   // Arrumadinho
      { productId: 6, available: true },   // Queijo Coalho
      { productId: 7, available: true },   // Cajuína
      { productId: 8, available: true },   // Umbuzada
      { productId: 9, available: true },   // Caldo de Cana
      { productId: 10, available: false }, // Licor de Jenipapo — esgotado
      { productId: 11, available: true },  // Cocada
      { productId: 12, available: true },  // Rapadura
      { productId: 13, available: true },  // Bolo de Rolo
      { productId: 14, available: true },  // Paçoca
      { productId: 15, available: true },  // Pé de Moleque
      { productId: 16, available: true },  // Canjica (junina)
      { productId: 17, available: true },  // Milho Assado (junina)
      { productId: 18, available: true },  // Quentão (junina)
      { productId: 19, available: true },  // Pamonha (junina)
      { productId: 20, available: true },  // Pão de Mel (natal)
      { productId: 21, available: true },  // Rabanada (natal)
    ],
  },
  {
    id: 'recife',
    name: 'Unidade Mercado',
    city: 'Recife',
    state: 'PE',
    address: 'Rua da Aurora, 78 – Boa Vista',
    phone: '(81) 99999-0002',
    emoji: '⚓',
    bgColor: 'bg-amber-50',
    products: [
      { productId: 1, available: true },   // Carne de Sol
      { productId: 2, available: true },   // Baião de Dois
      { productId: 3, available: true },   // Tapioca
      { productId: 4, available: true },   // Buchada de Bode
      { productId: 5, available: false },  // Arrumadinho — esgotado
      { productId: 6, available: true },   // Queijo Coalho
      { productId: 7, available: true },   // Cajuína
      { productId: 8, available: false },  // Umbuzada — esgotado
      { productId: 9, available: true },   // Caldo de Cana
      { productId: 10, available: true },  // Licor de Jenipapo
      { productId: 11, available: true },  // Cocada
      { productId: 13, available: true },  // Bolo de Rolo
      { productId: 14, available: true },  // Paçoca
      { productId: 16, available: true },  // Canjica (junina)
      { productId: 17, available: false }, // Milho Assado — esgotado
      { productId: 19, available: true },  // Pamonha (junina)
      { productId: 20, available: true },  // Pão de Mel (natal)
    ],
  },
  {
    id: 'natal',
    name: 'Unidade Praia',
    city: 'Natal',
    state: 'RN',
    address: 'Av. Praia de Ponta Negra, 330',
    phone: '(84) 99999-0003',
    emoji: '🏖️',
    bgColor: 'bg-sky-50',
    products: [
      { productId: 3, available: true },   // Tapioca
      { productId: 6, available: true },   // Queijo Coalho
      { productId: 7, available: true },   // Cajuína
      { productId: 8, available: true },   // Umbuzada
      { productId: 9, available: true },   // Caldo de Cana
      { productId: 11, available: true },  // Cocada
      { productId: 12, available: true },  // Rapadura
      { productId: 13, available: true },  // Bolo de Rolo
      { productId: 14, available: true },  // Paçoca
      { productId: 15, available: true },  // Pé de Moleque
      { productId: 16, available: true },  // Canjica (junina)
      { productId: 18, available: false }, // Quentão — esgotado
      { productId: 21, available: true },  // Rabanada (natal)
    ],
  },
];
