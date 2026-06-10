import type { PaymentMethod } from '../types';

export interface CardData {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
}

interface GatewayRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  cardData?: CardData;
}

interface GatewayResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

const GATEWAY_DECLINED_MESSAGE =
  'Pagamento recusado pelo gateway. Tente novamente ou escolha outra forma de pagamento.';

const GATEWAY_ERRORS = [
  GATEWAY_DECLINED_MESSAGE,
  'Saldo insuficiente. Verifique seu limite e tente novamente.',
  'Tempo limite excedido na comunicação com o gateway. Tente novamente.',
];

// Numbers that always trigger a decline (simulate invalid/non-existent cards)
const ALWAYS_DECLINE_CARDS = new Set([
  '4000000000000002',
  '4000000000000069',
  '4000000000000119',
  '5100000000000098',
  '0000000000000000',
]);

export const paymentService = {
  async processPayment(request: GatewayRequest): Promise<GatewayResponse> {
    const delay = 1500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    if (request.cardData) {
      const clean = request.cardData.number.replace(/\s/g, '');
      if (ALWAYS_DECLINE_CARDS.has(clean)) {
        return { success: false, errorMessage: GATEWAY_DECLINED_MESSAGE };
      }
    }

    const approved = Math.random() > 0.15;
    if (approved) {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      };
    }

    const errorMessage = GATEWAY_ERRORS[Math.floor(Math.random() * GATEWAY_ERRORS.length)];
    return { success: false, errorMessage };
  },
};
