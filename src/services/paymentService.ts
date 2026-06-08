import type { PaymentMethod } from '../types';

interface GatewayRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

interface GatewayResponse {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

const GATEWAY_ERRORS = [
  'Pagamento recusado pela operadora. Verifique os dados e tente novamente.',
  'Saldo insuficiente. Verifique seu limite e tente novamente.',
  'Tempo limite excedido na comunicação com o gateway. Tente novamente.',
];

// Simulates a real external payment gateway with network delay and realistic failure rate
export const paymentService = {
  async processPayment(request: GatewayRequest): Promise<GatewayResponse> {
    // Simulate network round-trip (1.5s – 2.5s)
    const delay = 1500 + Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 85% approval rate
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
