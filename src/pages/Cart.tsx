import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import type { Product } from '../types';

const fmt = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export function Cart() {
  const {
    items, removeFromCart, updateQuantity,
    subtotal, discount, total,
    appliedCoupon, applyCoupon, removeCoupon,
    totalItems, validateCart,
  } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [unavailableItems, setUnavailableItems] = useState<Product[]>([]);

  const handleApplyCoupon = (e: FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    if (result.success) {
      setCouponSuccess('Cupom aplicado com sucesso!');
      setCouponInput('');
    } else {
      setCouponError(result.error ?? 'Erro ao aplicar cupom.');
    }
  };

  const handleCheckout = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const invalid = validateCart();
    if (invalid.length > 0) {
      setUnavailableItems(invalid);
      return;
    }
    navigate('/checkout');
  };

  const removeUnavailableAndFinalize = () => {
    unavailableItems.forEach(p => removeFromCart(p.id));
    setUnavailableItems([]);
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-xl text-gray-500 mb-6">Seu carrinho está vazio</p>
          <Link
            to="/"
            className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
          >
            Continuar Comprando
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Meu Carrinho{' '}
          <span className="text-amber-600">({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Lista de itens ─────────────────────────────────── */}
          <div className="flex-1 space-y-3">
            {items.map(item => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100"
              >
                <Link to={`/produto/${item.product.id}`} className="shrink-0">
                  <div className={`${item.product.bgColor} w-16 h-16 rounded-xl flex items-center justify-center`}>
                    <span className="text-xl font-bold text-gray-500">{item.product.name.charAt(0)}</span>
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.product.name}</p>
                  <p className="text-xs text-amber-600 mb-1">{item.product.category}</p>
                  <p className="text-gray-500 text-sm">{fmt(item.product.price)} / un</p>
                </div>

                {/* Controles de quantidade */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product.id, -1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer font-bold"
                    aria-label="Diminuir quantidade"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product.id, +1)}
                    className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer font-bold"
                    aria-label="Aumentar quantidade"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal do item */}
                <p className="w-20 text-right font-bold text-amber-700 shrink-0">
                  {fmt(item.product.price * item.quantity)}
                </p>

                {/* Remover */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                  aria-label="Remover item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}

            <Link
              to="/"
              className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-sm transition-colors mt-2"
            >
              ← Continuar comprando
            </Link>
          </div>

          {/* ── Resumo do pedido ───────────────────────────────── */}
          <aside className="lg:w-80 shrink-0 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Resumo do Pedido</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Desconto</span>
                    <span>− {fmt(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-amber-700 text-xl">{fmt(total)}</span>
                </div>
              </div>

              {/* Cupom aplicado */}
              {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase tracking-wide">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-xs text-green-600 mt-0.5">{appliedCoupon.description}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-green-500 hover:text-red-500 transition-colors cursor-pointer text-xs font-semibold shrink-0"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cupom de desconto</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); setCouponSuccess(''); }}
                      placeholder="CÓDIGO"
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-3 py-2 rounded-xl text-sm transition-colors cursor-pointer"
                    >
                      Aplicar
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs">{couponError}</p>}
                  {couponSuccess && <p className="text-green-600 text-xs">{couponSuccess}</p>}
                  <p className="text-xs text-gray-400">Experimente: NORDESTE10 · FEIRAJUNINA</p>
                </form>
              )}

              {/* Finalizar */}
              {currentUser ? (
                <button
                  onClick={handleCheckout}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Finalizar Pedido
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl transition-colors text-center"
                  >
                    Entre para finalizar
                  </Link>
                  <p className="text-xs text-gray-400 text-center">Você precisa estar logado para concluir o pedido</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ── Modal: itens indisponíveis ───────────────────────── */}
      {unavailableItems.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-5">
              <h3 className="text-xl font-bold text-gray-800 mt-2">Itens indisponíveis</h3>
              <p className="text-gray-500 text-sm mt-2">
                Os itens abaixo não estão mais disponíveis e precisam ser removidos para continuar:
              </p>
            </div>
            <ul className="space-y-2 mb-6">
              {unavailableItems.map(p => (
                <li key={p.id} className="flex items-center gap-3 bg-red-50 rounded-xl p-3">
                  <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                onClick={() => setUnavailableItems([])}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={removeUnavailableAndFinalize}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer text-sm"
              >
                Remover e Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
