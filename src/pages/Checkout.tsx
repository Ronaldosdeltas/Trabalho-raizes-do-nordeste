import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { paymentService } from '../services/paymentService';
import { units } from '../data/units';
import type { PaymentMethod } from '../types';

type Step = 'review' | 'payment' | 'card' | 'processing' | 'success' | 'error';

function luhn(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function fmtCardNumber(v: string): string {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function fmtExpiry(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
}

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const PAYMENT_INFO: Record<PaymentMethod, { label: string; icon: string; description: string }> = {
  dinheiro:    { label: 'Dinheiro',           icon: '', description: 'Pague em espécie na retirada' },
  credito:     { label: 'Cartão de Crédito',  icon: '', description: 'Visa, Mastercard, Elo e outros' },
  debito:      { label: 'Cartão de Débito',   icon: '', description: 'Débito à vista' },
  pix:         { label: 'PIX',                icon: '', description: 'Transferência instantânea' },
  raizes_card: { label: 'Raízes Card',        icon: '', description: 'Cartão fidelidade Raízes do Nordeste' },
};

const STEP_LABELS: Record<Exclude<Step, 'processing' | 'card' | 'error'>, string> = {
  review:  'Revisão',
  payment: 'Pagamento',
  success: 'Confirmação',
};

function StepIndicator({ step }: { step: Step }) {
  const steps: Array<Exclude<Step, 'processing' | 'card' | 'error'>> = ['review', 'payment', 'success'];
  const current = step === 'processing' || step === 'card' ? 'payment' : step === 'error' ? 'payment' : step;
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
              {STEP_LABELS[s as keyof typeof STEP_LABELS]}
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
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

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
  const handleRetry = () => {
    setGatewayError('');
    setStep(selectedPayment === 'credito' || selectedPayment === 'debito' ? 'card' : 'payment');
  };

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.length !== 16) {
      errors.number = 'Número deve ter 16 dígitos';
    } else if (!luhn(clean)) {
      errors.number = 'Número de cartão inválido';
    }
    if (!cardHolder.trim()) errors.holder = 'Nome é obrigatório';
    const expiryMatch = cardExpiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expiryMatch) {
      errors.expiry = 'Validade inválida (MM/AA)';
    } else {
      const month = parseInt(expiryMatch[1]);
      const year = parseInt('20' + expiryMatch[2]);
      const now = new Date();
      if (month < 1 || month > 12) errors.expiry = 'Mês inválido';
      else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1))
        errors.expiry = 'Cartão expirado';
    }
    if (cardCvv.length < 3) errors.cvv = 'CVV inválido';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardPayment = async () => {
    if (!validateCard() || !selectedPayment || !currentUser) return;
    setStep('processing');
    const result = await paymentService.processPayment({
      orderId: crypto.randomUUID(),
      amount: total,
      paymentMethod: selectedPayment,
      cardData: { number: cardNumber.replace(/\s/g, ''), holderName: cardHolder, expiry: cardExpiry, cvv: cardCvv },
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
      setGatewayError(result.errorMessage ?? 'Pagamento recusado pelo gateway. Tente novamente ou escolha outra forma de pagamento.');
      setStep('error');
    }
  };

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
                onClick={() => {
                  if (selectedPayment === 'credito' || selectedPayment === 'debito') {
                    setStep('card');
                  } else {
                    handleProcessPayment();
                  }
                }}
                disabled={!selectedPayment}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {selectedPayment === 'credito' || selectedPayment === 'debito'
                  ? `Inserir dados do ${PAYMENT_INFO[selectedPayment].label} →`
                  : `Confirmar pagamento ${selectedPayment ? `(${PAYMENT_INFO[selectedPayment].label})` : ''}`
                }
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

        {/* ── Card data step ─────────────────────────────────── */}
        {step === 'card' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dados do cartão</h2>
            <StepIndicator step={step} />

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
              <div className="text-sm text-gray-500 mb-1">Total a pagar</div>
              <p className="text-3xl font-bold text-amber-700">{fmt(total)}</p>
              {selectedPayment && (
                <p className="text-xs text-gray-400 mt-1">{PAYMENT_INFO[selectedPayment].label}</p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 space-y-4">
              <h3 className="font-bold text-gray-700">Informações do cartão</h3>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Número do cartão</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={e => setCardNumber(fmtCardNumber(e.target.value))}
                  maxLength={19}
                  className={`w-full border rounded-xl px-4 py-3 text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${cardErrors.number ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nome no cartão</label>
                <input
                  type="text"
                  placeholder="Como aparece no cartão"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value.toUpperCase())}
                  className={`w-full border rounded-xl px-4 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${cardErrors.holder ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {cardErrors.holder && <p className="text-red-500 text-xs mt-1">{cardErrors.holder}</p>}
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Validade</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/AA"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(fmtExpiry(e.target.value))}
                    maxLength={5}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${cardErrors.expiry ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-600 mb-1">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className={`w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-colors ${cardErrors.cvv ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 space-y-0.5">
                <p className="font-semibold mb-1">Cartões para teste:</p>
                <p>✓ Aprovado: <span className="font-mono">4111 1111 1111 1111</span></p>
                <p>✗ Recusado: <span className="font-mono">4000 0000 0000 0002</span></p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleCardPayment}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Confirmar pagamento
              </button>
              <button
                onClick={() => setStep('payment')}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                ← Trocar forma de pagamento
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
