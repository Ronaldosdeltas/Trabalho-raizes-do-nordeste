import { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { orderService } from '../../services/orderService';
import { authService } from '../../services/authService';
import type { Order, OrderStatus } from '../../types';

const STATUS_FLOW: OrderStatus[] = ['Pedido recebido', 'Em preparo', 'Pronto para retirada', 'Retirado'];

const STATUS_CONFIG: Record<OrderStatus, { color: string; dot: string }> = {
  'Pedido recebido':    { color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  'Em preparo':         { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'Pronto para retirada': { color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  'Retirado':           { color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Cancelado':          { color: 'bg-red-100 text-red-600',     dot: 'bg-red-500' },
};

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

type Filter = OrderStatus | 'Todos';

export function AdminOrders() {
  const { currentAdmin } = useAdmin();
  const [orders, setOrders] = useState<Order[]>(() => orderService.getAllOrders());
  const [filter, setFilter] = useState<Filter>('Todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refresh = () => setOrders(orderService.getAllOrders());

  const visibleOrders = useMemo(() => {
    let list = orders;
    if (currentAdmin?.unitId) {
      list = list.filter(o => o.unitId === currentAdmin.unitId || !o.unitId);
    }
    if (filter !== 'Todos') {
      list = list.filter(o => o.status === filter);
    }
    return list;
  }, [orders, filter, currentAdmin]);

  const advanceStatus = (order: Order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return;
    orderService.updateStatus(order.id, STATUS_FLOW[idx + 1]);
    refresh();
  };

  const cancelOrder = (order: Order) => {
    if (!window.confirm('Deseja cancelar este pedido?')) return;
    orderService.updateStatus(order.id, 'Cancelado');
    refresh();
  };

  const getUserEmail = (userId: string) => {
    const user = authService.getUserById(userId);
    return user?.email ?? userId.slice(0, 8);
  };

  const filterOptions: Filter[] = ['Todos', ...STATUS_FLOW, 'Cancelado'];
  const pendingCount = orders.filter(o => o.status === 'Pedido recebido' || o.status === 'Em preparo').length;

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {visibleOrders.length} pedido{visibleOrders.length !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Orders */}
        {visibleOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <p>Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleOrders.map(order => {
              const cfg = STATUS_CONFIG[order.status];
              const isExpanded = expandedId === order.id;
              const canAdvance = STATUS_FLOW.includes(order.status) && STATUS_FLOW.indexOf(order.status) < STATUS_FLOW.length - 1;
              const nextStatus = canAdvance ? STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1] : null;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 flex-wrap"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {order.status}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                      </div>
                      <p className="text-xs text-gray-500">{getUserEmail(order.userId)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-700">{fmt(order.total)}</span>
                      <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                      {/* Items */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Itens do pedido</p>
                        <ul className="space-y-1">
                          {order.items.map(item => (
                            <li key={item.product.id} className="flex items-center justify-between text-sm">
                              <span>{item.quantity}× {item.product.name}</span>
                              <span className="text-gray-600">{fmt(item.unitPrice * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Totals */}
                      <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span><span>{fmt(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Desconto {order.coupon && `(${order.coupon.code})`}</span>
                            <span>- {fmt(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1 mt-1">
                          <span>Total</span><span>{fmt(order.total)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      {order.status !== 'Cancelado' && order.status !== 'Retirado' && (
                        <div className="flex gap-3 flex-wrap">
                          {canAdvance && nextStatus && (
                            <button
                              onClick={() => advanceStatus(order)}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                            >
                              Avançar → {nextStatus}
                            </button>
                          )}
                          <button
                            onClick={() => cancelOrder(order)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                          >
                            Cancelar pedido
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
