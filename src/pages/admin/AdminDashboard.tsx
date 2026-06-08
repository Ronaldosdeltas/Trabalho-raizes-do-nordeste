import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { orderService } from '../../services/orderService';
import { productService } from '../../services/productService';
import { unitService } from '../../services/unitService';
import type { OrderStatus } from '../../types';

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

const PENDING: OrderStatus[] = ['Pedido recebido', 'Em preparo'];

export function AdminDashboard() {
  const { currentAdmin } = useAdmin();

  const stats = useMemo(() => {
    const allOrders = orderService.getAllOrders();
    const orders = currentAdmin?.unitId
      ? allOrders.filter(o => o.unitId === currentAdmin.unitId)
      : allOrders;

    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const revenue = orders.reduce((s, o) => s + o.total, 0);
    const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
    const pending = orders.filter(o => PENDING.includes(o.status)).length;
    const products = productService.getProducts().filter(p => p.available).length;

    return { totalOrders: orders.length, todayOrders: todayOrders.length, revenue, todayRevenue, pending, products };
  }, [currentAdmin]);

  const recentOrders = useMemo(() => {
    const allOrders = orderService.getAllOrders();
    const orders = currentAdmin?.unitId
      ? allOrders.filter(o => o.unitId === currentAdmin.unitId)
      : allOrders;
    return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [currentAdmin]);

  const units = unitService.getUnits();

  const statCards = [
    { label: 'Pedidos hoje', value: stats.todayOrders, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Receita hoje', value: fmt(stats.todayRevenue), color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Pendentes', value: stats.pending, color: 'bg-amber-50 border-amber-200 text-amber-700' },
    { label: 'Produtos ativos', value: stats.products, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  ];

  const statusColors: Record<string, string> = {
    'Pedido recebido': 'bg-blue-100 text-blue-700',
    'Em preparo': 'bg-amber-100 text-amber-700',
    'Pronto para retirada': 'bg-purple-100 text-purple-700',
    'Retirado': 'bg-green-100 text-green-700',
    'Cancelado': 'bg-red-100 text-red-600',
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bem-vindo, {currentAdmin?.name}
            {currentAdmin?.unitId && (
              <> — Unidade{' '}
                <span className="font-semibold capitalize text-amber-700">
                  {units.find(u => u.id === currentAdmin.unitId)?.name ?? currentAdmin.unitId}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.color}`}>
              <p className="text-2xl font-black">{card.value}</p>
              <p className="text-sm font-medium mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold text-gray-800">Receita Total</h2>
              <span className="text-xs text-gray-400">{stats.totalOrders} pedidos</span>
            </div>
            <p className="text-3xl font-black text-amber-700">{fmt(stats.revenue)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-3">Ações Rápidas</h2>
            <div className="space-y-2">
              <Link to="/admin/pedidos" className="block text-sm text-amber-700 hover:text-amber-800 font-medium">
                Gerenciar pedidos pendentes ({stats.pending})
              </Link>
              <Link to="/admin/produtos" className="block text-sm text-amber-700 hover:text-amber-800 font-medium">
                Gerenciar produtos
              </Link>
              <Link to="/admin/relatorios" className="block text-sm text-amber-700 hover:text-amber-800 font-medium">
                Ver relatórios
              </Link>
            </div>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Pedidos Recentes</h2>
            <Link to="/admin/pedidos" className="text-sm text-amber-700 hover:underline font-medium">
              Ver todos
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-5 py-8 text-center text-gray-400 text-sm">Nenhum pedido ainda.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map(order => (
                <div key={order.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleString('pt-BR', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-amber-700">{fmt(order.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
