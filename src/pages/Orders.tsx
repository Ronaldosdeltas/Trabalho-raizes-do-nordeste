import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import type { Order, OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  'Pedido recebido':    { label: 'Pedido recebido',    color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  'Em preparo':         { label: 'Em preparo',         color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'Pronto para retirada': { label: 'Pronto para retirada', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'Retirado':           { label: 'Retirado',           color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Cancelado':          { label: 'Cancelado',          color: 'bg-red-100 text-red-600',     dot: 'bg-red-500' },
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export function Orders() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (currentUser) {
      setOrders(orderService.getUserOrders(currentUser.userId));
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📦 Meus Pedidos</h2>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📦</p>
            <p className="text-xl text-gray-500 mb-6">Você ainda não fez nenhum pedido</p>
            <Link
              to="/"
              className="bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Fazer meu primeiro pedido
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cfg = statusConfig[order.status];
              const shortId = order.id.slice(0, 8).toUpperCase();
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

              return (
                <Link
                  key={order.id}
                  to={`/pedidos/${order.id}`}
                  className="block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-gray-800">Pedido #{shortId}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {itemCount} {itemCount === 1 ? 'item' : 'itens'}
                        {order.coupon && (
                          <span className="ml-2 text-green-600 text-xs">🎟️ {order.coupon.code}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <p className="text-lg font-bold text-amber-700 mt-2">{fmt(order.total)}</p>
                    </div>
                  </div>

                  {/* Preview dos itens */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {order.items.slice(0, 4).map(item => (
                      <span
                        key={item.product.id}
                        className="text-xl"
                        title={item.product.name}
                      >
                        {item.product.emoji}
                      </span>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-xs text-gray-400 self-center">
                        +{order.items.length - 4} mais
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
