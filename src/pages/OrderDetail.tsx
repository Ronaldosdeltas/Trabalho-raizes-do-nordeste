import { Fragment, useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { StarRating } from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { orderService } from '../services/orderService';
import { reviewService } from '../services/reviewService';
import { units } from '../data/units';
import type { Order, OrderStatus, PaymentMethod } from '../types';

// ── helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { label: string; color: string; dot: string; step: number }> = {
  'Pedido recebido':      { label: 'Pedido recebido',      color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500',   step: 1 },
  'Em preparo':           { label: 'Em preparo',           color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500',  step: 2 },
  'Pronto para retirada': { label: 'Pronto para retirada', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', step: 3 },
  'Retirado':             { label: 'Retirado',             color: 'bg-green-100 text-green-700',   dot: 'bg-green-500',  step: 4 },
  'Cancelado':            { label: 'Cancelado',            color: 'bg-red-100 text-red-600',       dot: 'bg-red-500',    step: 0 },
};

const STATUS_STEPS: OrderStatus[] = ['Pedido recebido', 'Em preparo', 'Pronto para retirada', 'Retirado'];

const PAYMENT_LABELS: Record<PaymentMethod, { label: string; icon: string }> = {
  dinheiro:    { label: 'Dinheiro',          icon: '' },
  credito:     { label: 'Cartão de Crédito', icon: '' },
  pix:         { label: 'PIX',               icon: '' },
  raizes_card: { label: 'Raízes Card',       icon: '' },
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

// ── tipos locais ──────────────────────────────────────────────────────────────

interface ReviewState {
  rating: number;
  comment: string;
  submitted: boolean;
}

// ── componente ────────────────────────────────────────────────────────────────

export function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { currentUser } = useAuth();
  const { addMultipleToCart } = useCart();

  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [repeatSuccess, setRepeatSuccess] = useState(false);
  const [reviews, setReviews] = useState<Record<number, ReviewState>>({});

  useEffect(() => {
    const found = orderService.getOrderById(orderId ?? '');
    setOrder(found ?? null);
  }, [orderId]);

  useEffect(() => {
    if (!order || !currentUser || order.status !== 'Retirado') return;
    const initial: Record<number, ReviewState> = {};
    order.items.forEach(item => {
      const existing = reviewService.getOrderReview(currentUser.userId, item.product.id, order.id);
      initial[item.product.id] = {
        rating: existing?.rating ?? 0,
        comment: existing?.comment ?? '',
        submitted: !!existing,
      };
    });
    setReviews(initial);
  }, [order, currentUser]);

  if (order === undefined) return null;
  if (order === null || order.userId !== currentUser?.userId) {
    return <Navigate to="/pedidos" replace />;
  }

  const cfg = statusConfig[order.status];
  const isDelivered = order.status === 'Retirado';
  const canCancel = order.status === 'Pedido recebido' || order.status === 'Em preparo';
  const isCancelled = order.status === 'Cancelado';
  const shortId = order.id.slice(0, 8).toUpperCase();

  const unit = order.unitId ? units.find(u => u.id === order.unitId) ?? null : null;
  const paymentInfo = order.paymentMethod ? PAYMENT_LABELS[order.paymentMethod] : null;

  // ── handlers ────────────────────────────────────────────────────────────────

  const handleCancel = () => {
    orderService.updateStatus(order.id, 'Cancelado');
    setOrder(prev => (prev ? { ...prev, status: 'Cancelado' } : null));
    setShowCancelConfirm(false);
  };

  const handleRepeatOrder = () => {
    addMultipleToCart(
      order.items.map(item => ({ product: item.product, quantity: item.quantity }))
    );
    setRepeatSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setReviewField = (productId: number, field: keyof ReviewState, value: string | number | boolean) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value },
    }));
  };

  const handleSubmitReview = (productId: number) => {
    const rs = reviews[productId];
    if (!rs || rs.rating === 0 || !currentUser) return;
    reviewService.addReview({
      id: crypto.randomUUID(),
      userId: currentUser.userId,
      productId,
      orderId: order.id,
      rating: rs.rating,
      comment: rs.comment.trim() || undefined,
      createdAt: new Date().toISOString(),
    });
    setReviewField(productId, 'submitted', true);
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Banner de repetição bem-sucedida */}
        {repeatSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center justify-between gap-3">
            <p className="text-green-700 font-semibold text-sm">
              Todos os itens foram adicionados ao carrinho!
            </p>
            <Link
              to="/cart"
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shrink-0"
            >
              Ver Carrinho
            </Link>
          </div>
        )}

        {/* ── Cabeçalho ───────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Link to="/pedidos" className="text-amber-600 hover:text-amber-700 text-sm font-semibold mb-2 block">
              ← Meus Pedidos
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">Pedido #{shortId}</h2>
            <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-full ${cfg.color}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>

        {/* ── Linha do tempo ──────────────────────────────────── */}
        {!isCancelled ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            {/* Círculos + conectores */}
            <div className="flex items-center">
              {STATUS_STEPS.map((s, idx) => {
                const done   = cfg.step > idx + 1;
                const active = cfg.step === idx + 1;
                return (
                  <Fragment key={s}>
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors shrink-0
                        ${done || active ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-400'}
                        ${active ? 'ring-4 ring-amber-100' : ''}`}
                      >
                        {done ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          idx + 1
                        )}
                      </div>
                    </div>
                    {idx < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 rounded-full transition-colors ${cfg.step > idx + 1 ? 'bg-amber-400' : 'bg-gray-100'}`} />
                    )}
                  </Fragment>
                );
              })}
            </div>
            {/* Rótulos abaixo */}
            <div className="flex mt-2">
              {STATUS_STEPS.map((s, idx) => {
                const active = cfg.step >= idx + 1;
                return (
                  <p
                    key={s}
                    className={`flex-1 text-center text-xs leading-tight px-0.5
                      ${active ? 'text-amber-700 font-semibold' : 'text-gray-400'}`}
                  >
                    {s}
                  </p>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <p className="text-red-600 font-bold text-lg">Pedido cancelado</p>
            <p className="text-red-500 text-sm mt-1">Este pedido foi cancelado e não será mais processado.</p>
          </div>
        )}

        {/* ── Itens do pedido ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Itens do Pedido</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items.map(item => (
              <div key={item.product.id} className="flex items-center gap-4 px-5 py-3">
                <div className={`${item.product.bgColor} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                  <span className="text-lg font-bold text-gray-500">{item.product.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-500">{fmt(item.unitPrice)} × {item.quantity}</p>
                </div>
                <p className="font-bold text-amber-700 shrink-0">
                  {fmt(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Resumo financeiro ────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-2">
          <h3 className="font-bold text-gray-800 mb-3">Resumo financeiro</h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{fmt(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
              <span>
                {order.coupon
                  ? `Desconto (${order.coupon.code})`
                  : 'Desconto aplicado'}
              </span>
              <span>− {fmt(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
            <span>Total pago</span>
            <span className="text-amber-700 text-xl">{fmt(order.total)}</span>
          </div>
        </div>

        {/* ── Detalhes da retirada e pagamento ─────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="font-bold text-gray-800 mb-1">Detalhes do pedido</h3>

          {paymentInfo && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Forma de pagamento</span>
              <span className="font-semibold text-gray-700">
                {paymentInfo.label}
              </span>
            </div>
          )}

          {unit ? (
            <>
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 shrink-0">Unidade de retirada</span>
                <span className="font-semibold text-gray-700 text-right ml-4">
                  {unit.name}
                </span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-gray-500 shrink-0">Endereço</span>
                <span className="text-gray-700 text-right ml-4">
                  {unit.address}, {unit.city} – {unit.state}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Telefone</span>
                <span className="text-gray-700">{unit.phone}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Unidade de retirada</span>
              <span className="text-gray-400 italic">Não informada</span>
            </div>
          )}

          <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-gray-500">Data e hora do pedido</span>
            <span className="text-gray-700 text-right ml-4 text-xs">{formatDate(order.createdAt)}</span>
          </div>
        </div>

        {/* ── Repetir Pedido (apenas para pedidos retirados) ────── */}
        {isDelivered && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-3">
              Gostou? Repita este pedido com um clique e todos os itens voltam ao carrinho!
            </p>
            <button
              onClick={handleRepeatOrder}
              disabled={repeatSuccess}
              className={`w-full font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm
                ${repeatSuccess
                  ? 'bg-green-100 text-green-600 cursor-default'
                  : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              {repeatSuccess ? 'Itens adicionados!' : 'Repetir Pedido'}
            </button>
          </div>
        )}

        {/* ── Avaliação de Produtos (apenas para pedidos retirados) */}
        {isDelivered && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Avalie os Produtos</h3>
              <p className="text-xs text-gray-500 mt-1">Como foi a sua experiência?</p>
            </div>

            <div className="divide-y divide-gray-50">
              {order.items.map(item => {
                const rs = reviews[item.product.id];
                if (!rs) return null;

                return (
                  <div key={item.product.id} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`${item.product.bgColor} w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}>
                        <span className="text-base font-bold text-gray-500">{item.product.name.charAt(0)}</span>
                      </div>
                      <p className="font-semibold text-gray-800 truncate text-sm flex-1">{item.product.name}</p>
                      {rs.submitted && (
                        <span className="text-xs text-green-600 font-semibold shrink-0">Avaliado</span>
                      )}
                    </div>

                    {rs.submitted ? (
                      <div className="space-y-1">
                        <StarRating value={rs.rating} readonly size="md" />
                        {rs.comment && (
                          <p className="text-sm text-gray-600 italic mt-2">"{rs.comment}"</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Sua nota</p>
                          <StarRating
                            value={rs.rating}
                            onChange={v => setReviewField(item.product.id, 'rating', v)}
                            size="lg"
                          />
                        </div>
                        <textarea
                          value={rs.comment}
                          onChange={e => setReviewField(item.product.id, 'comment', e.target.value)}
                          placeholder="Comentário (opcional)..."
                          rows={2}
                          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none text-gray-700"
                        />
                        <button
                          onClick={() => handleSubmitReview(item.product.id)}
                          disabled={rs.rating === 0}
                          className={`text-sm font-semibold px-5 py-2 rounded-xl transition-colors
                            ${rs.rating === 0
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'}`}
                        >
                          Enviar Avaliação
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Cancelamento ─────────────────────────────────────── */}
        {canCancel && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 mb-3">
              Este pedido está com status <strong>"{order.status}"</strong> e pode ser cancelado.
            </p>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Cancelar Pedido
            </button>
          </div>
        )}
      </main>

      {/* ── Modal de confirmação de cancelamento ─────────────── */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 mt-3 mb-2">Cancelar Pedido</h3>
              <p className="text-gray-600 text-sm">
                Tem certeza que deseja cancelar o <strong>Pedido #{shortId}</strong>?
              </p>
            </div>

            {/* Política de cancelamento */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-xs text-amber-800 space-y-1.5">
              <p className="font-bold text-amber-900">Política de cancelamento</p>
              <p>• Cancelamentos são aceitos apenas com status <em>"Pedido recebido"</em> ou <em>"Em preparo"</em>.</p>
              <p>• Pagamentos por PIX, cartão de crédito ou débito têm estorno em até 5 dias úteis.</p>
              <p>• Pagamentos em dinheiro ou Raízes Card são cancelados sem custo.</p>
              <p>• Esta ação não pode ser desfeita.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Voltar
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
