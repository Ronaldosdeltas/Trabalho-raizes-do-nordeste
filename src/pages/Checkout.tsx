import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { units } from '../data/units';
import type { PaymentMethod } from '../types';

type Step = 'review' | 'payment' | 'processing' | 'success' | 'error';

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const PAYMENT_INFO: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  dinheiro:    { label: 'Dinheiro',           icon: '', description: 'Pague em espécie na retirada' },
  credito:     { label: 'Cartão de Crédito',  icon: '', description: 'Visa, Mastercard, Elo e outros' },
  debito:      { label: 'Cartão de Débito',   icon: '', description: 'Débito à vista' },
  pix:         { label: 'PIX',                icon: '', description: 'Transferência instantânea' },
  raizes_card: { label: 'Raízes Card',        icon: '', description: 'Cartão fidelidade Raízes do Nordeste' },
};

const STEP_LABELS: Record<Exclude<Step, 'processing' | 'error'>, string> = {
  review:  'Revisão',
  payment: 'Pagamento',
  success: 'Confirmação',
};

function StepIndicator({ step }: { step: Step }) {
  const steps: Array<Exclude<Step, 'processing' | 'error'>> = ['review', 'payment', 'success'];
  const current = step === 'processing' ? 'payment' : step === 'error' ? 'payment' : step;
  const currentIdx = steps.indexOf(current);

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors
                ${i < currentIdx ? 'bg-amber-600 text-white' : i === currentIdx ? 'bg-amber-600 text-white ring-4 ring-amber-100' : 'bg-gray-200 text-gray-500'}`}
            >
              {i < currentIdx ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`text-xs mt-1 font-medium ${i === currentIdx ? 'text-amber-700' : 'text-gray-400'}`}>
              {STEP_LABELS[s]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 sm:w-24 h-0.5 mb-4 mx-1 transition-colors ${i < currentIdx ? 'bg-amber-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, discount, total, appliedCoupon, currentUnitId, checkout, totalItems } = useCart();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<Step>('review');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState<number>(0);
  const [transactionId, setTransactionId] = useState<string>('');
  const [gatewayError, setGatewayError] = useState<string>('');

  const unit = currentUnitId ? units.find(u => u.id === currentUnitId) ?? null : null;

  // Protect: redirect if cart becomes empty and we're not on the success screen
  useEffect(() => {
    if (items.length === 0 && step !== 'success') {
      navigate('/cart');
    }
  }, [items.length, step, navigate]);

  const availableMethods: PaymentMethod[] = unit
    ? unit.paymentMethods
    : ['dinheiro', 'credito', 'debito', 'pix', 'raizes_card'];

  const prepTime =
    totalItems <= 3 ? '10 a 15' :
    totalItems <= 6 ? '15 a 25' :
    '25 a 35';

  // ── Step handlers ──────────────────────────────────────────
  const handleProceedToPayment = () => setStep('payment');

  const handleProcessPayment = async () => {
    if (!selectedPayment || !currentUser) return;
    setStep('processing');

    const result = await paymentService.processPayment({
      orderId: crypto.randomUUID(),
      amount: total,
      paymentMethod: selectedPayment,
    });

    if (result.success) {
      const totalBeforeCheckout = total;
      const checkoutResult = checkout(currentUser.userId, selectedPayment);
      if (checkoutResult.success && checkoutResult.orderId) {
        setConfirmedOrderId(checkoutResult.orderId);
        setConfirmedTotal(totalBeforeCheckout);
        setTransactionId(result.transactionId ?? '');
        setStep('success');
      } else {
        setGatewayError('Erro interno ao registrar o pedido. Tente novamente.');
        setStep('error');
      }
    } else {
      setGatewayError(result.errorMessage ?? 'Pagamento recusado. Tente novamente.');
      setStep('error');
    }
  };

  const handleCancel = () => navigate('/cart');
  const handleRetry = () => { setGatewayError(''); setStep('payment'); };

  // ── Rendering ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">

        {/* ── Processing overlay ─────────────────────────────── */}
        {step === 'processing' && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
              <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-5" />
              <p className="font-bold text-gray-800 text-lg">Processando pagamento…</p>
              <p className="text-gray-500 text-sm mt-2">Conectando ao gateway de pagamento</p>
            </div>
          </div>
        )}

        {/* ── Success screen ─────────────────────────────────── */}
        {step === 'success' && confirmedOrderId && (
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pedido confirmado!</h2>
              <p className="text-gray-500 mb-6">Seu pagamento foi aprovado e o pedido está sendo preparado.</p>

              <div className="bg-amber-50 rounded-xl p-5 mb-6 text-left space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Número do pedido</span>
                  <span className="font-mono font-bold text-amber-700 text-xs">{confirmedOrderId.slice(0, 8).toUpperCase()}</span>
                </div>
                {transactionId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Transação</span>
                    <span className="font-mono text-xs text-gray-600">{transactionId}</span>
                  </div>
                )}
                {selectedPayment && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Forma de pagamento</span>
                    <span className="font-semibold text-gray-700">
                      {PAYMENT_INFO[selectedPayment].label}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total pago</span>
                  <span className="font-bold text-gray-800">{fmt(confirmedTotal)}</span>
                </div>
                {unit && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Retirada em</span>
                    <span className="font-semibold text-gray-700">{unit.name} – {unit.city}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Previsão de preparo</span>
                  <span className="font-semibold text-amber-700">{prepTime} minutos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                    Pedido recebido
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to={`/pedidos/${confirmedOrderId}`}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors text-center"
                >
                  Acompanhar pedido
                </Link>
                <Link
                  to="/"
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-center"
                >
                  Voltar ao início
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Error screen ───────────────────────────────────── */}
        {step === 'error' && (
          <div className="text-center">
            <StepIndicator step={step} />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Falha no pagamento</h2>
              <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 mb-6">{gatewayError}</p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Tentar novamente
                </button>
                <button
                  onClick={() => { setSelectedPayment(null); setGatewayError(''); setStep('payment'); }}
                  className="w-full border border-amber-300 hover:bg-amber-50 text-amber-700 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Trocar forma de pagamento
                </button>
                <button
                  onClick={handleCancel}
                  className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar e voltar ao carrinho
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Review step ────────────────────────────────────── */}
        {step === 'review' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Finalizar pedido</h2>
            <StepIndicator step={step} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <h3 className="font-bold text-gray-700 mb-4">Itens do pedido</h3>
              <div className="divide-y divide-gray-50">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 py-3">
                    <div className={`${item.product.bgColor} w-11 h-11 rounded-xl flex items-center justify-center shrink-0`}>
                      <span className="text-base font-bold text-gray-500">{item.product.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{fmt(item.product.price)} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-amber-700 text-sm shrink-0">
                      {fmt(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 space-y-3">
              <h3 className="font-bold text-gray-700 mb-1">Resumo financeiro</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Desconto {appliedCoupon ? `(${appliedCoupon.code})` : ''}</span>
                  <span>− {fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-3">
                <span>Total</span>
                <span className="text-amber-700 text-xl">{fmt(total)}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 space-y-3">
              <h3 className="font-bold text-gray-700">Informações de retirada</h3>
              {unit ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unidade</span>
                    <span className="font-semibold text-gray-700">{unit.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Endereço</span>
                    <span className="font-medium text-gray-700 text-right max-w-[55%]">{unit.address}, {unit.city} – {unit.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Telefone</span>
                    <span className="font-medium text-gray-700">{unit.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Nenhuma unidade selecionada.</p>
              )}
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="text-gray-500">Previsão de preparo</span>
                <span className="font-bold text-amber-700">{prepTime} minutos</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Escolher forma de pagamento →
              </button>
              <button
                onClick={handleCancel}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                ← Cancelar e voltar ao carrinho
              </button>
            </div>
          </>
        )}

        {/* ── Payment step ───────────────────────────────────── */}
        {step === 'payment' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Forma de pagamento</h2>
            <StepIndicator step={step} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Total a pagar</span>
              </div>
              <p className="text-3xl font-bold text-amber-700">{fmt(total)}</p>
              {unit && (
                <p className="text-xs text-gray-400 mt-1">{unit.name} — {unit.city}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="font-bold text-gray-700 mb-4">Selecione como deseja pagar</h3>
              <div className="space-y-3">
                {availableMethods.map(method => {
                  const info = PAYMENT_INFO[method];
                  const selected = selectedPayment === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setSelectedPayment(method)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left
                        ${selected
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
                        }`}
                    >
                      <div className="flex-1">
                        <p className={`font-semibold ${selected ? 'text-amber-800' : 'text-gray-800'}`}>
                          {info.label}
                        </p>
                        <p className="text-xs text-gray-500">{info.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${selected ? 'border-amber-600 bg-amber-600' : 'border-gray-300'}`}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleProcessPayment}
                disabled={!selectedPayment}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                Confirmar pagamento {selectedPayment ? `(${PAYMENT_INFO[selectedPayment].label})` : ''}
              </button>
              <button
                onClick={() => setStep('review')}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                ← Voltar à revisão
              </button>
              <button
                onClick={handleCancel}
                className="w-full text-gray-400 hover:text-gray-600 font-medium py-2 transition-colors cursor-pointer text-sm"
              >
                Cancelar e voltar ao carrinho
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
