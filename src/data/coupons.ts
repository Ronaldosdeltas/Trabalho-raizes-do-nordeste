import type { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    code: 'NORDESTE10',
    type: 'percentage',
    value: 10,
    description: '10% de desconto em qualquer pedido',
  },
  {
    code: 'PRIMEIRACOMPRA',
    type: 'fixed',
    value: 15,
    description: 'R$ 15,00 de desconto na primeira compra',
    minOrder: 30,
  },
  {
    code: 'FEIRAJUNINA',
    type: 'percentage',
    value: 20,
    description: '20% de desconto — Especial São João',
  },
  {
    code: 'BEMVINDO5',
    type: 'percentage',
    value: 5,
    description: '5% de desconto de boas-vindas',
  },
];
