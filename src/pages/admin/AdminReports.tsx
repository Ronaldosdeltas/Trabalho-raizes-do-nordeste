import { useState, useMemo } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useAdmin } from '../../contexts/AdminContext';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

type Period = 'today' | '7days' | '30days' | 'all';

const fmt = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

function filterByPeriod(orders: Order[], period: Period): Order[] {
  const now = new Date();
  return orders.filter(o => {
    const d = new Date(o.createdAt);
    if (period === 'today') return d.toDateString() === now.toDateString();
    if (period === '7days') return (now.getTime() - d.getTime()) <= 7 * 86400000;
    if (period === '30days') return (now.getTime() - d.getTime()) <= 30 * 86400000;
    return true;
  });
}

function downloadCSV(orders: Order[]) {
  const header = ['ID', 'Data', 'Usuario', 'Unidade', 'Subtotal', 'Desconto', 'Total', 'Status', 'Cupom'];
  const rows = orders.map(o => [
    o.id.slice(0, 8).toUpperCase(),
    new Date(o.createdAt).toLocaleString('pt-BR'),
    o.userId,
    o.unitId ?? '—',
    o.subtotal.toFixed(2),
    o.discount.toFixed(2),
    o.total.toFixed(2),
    o.status,
    o.coupon?.code ?? '—',
  ]);
  const csv = [header, ...rows].map(r => r.join(';')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  '7days': 'Últimos 7 dias',
  '30days': 'Últimos 30 dias',
  all: 'Todo o período',
};

export function AdminReports() {
  const { currentAdmin } = useAdmin();
  const [period, setPeriod] = useState<Period>('30days');

  const allOrders = useMemo(() => {
    const orders = orderService.getAllOrders();
    return currentAdmin?.unitId
      ? orders.filter(o => o.unitId === currentAdmin.unitId || !o.unitId)
      : orders;
  }, [currentAdmin]);

  const filtered = useMemo(() => filterByPeriod(allOrders, period), [allOrders, period]);

  const stats = useMemo(() => {
    const delivered = filtered.filter(o => o.status === 'Retirado');
    const revenue = delivered.reduce((s, o) => s + o.total, 0);
    const avgTicket = delivered.length > 0 ? revenue / delivered.length : 0;
    const cancelled = filtered.filter(o => o.status === 'Cancelado').length;
    return { total: filtered.length, delivered: delivered.length, revenue, avgTicket, cancelled };
  }, [filtered]);

  // Top products
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; emoji: string; qty: number; revenue: number }> = {};
    filtered.forEach(o => {
      o.items.forEach(item => {
        const key = String(item.product.id);
        if (!counts[key]) counts[key] = { name: item.product.name, emoji: item.product.emoji, qty: 0, revenue: 0 };
        counts[key].qty += item.quantity;
        counts[key].revenue += item.quantity * item.unitPrice;
      });
    });
    return Object.values(counts).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [filtered]);

  // Peak hours
  const peakHours = useMemo(() => {
    const hours = Array(24).fill(0) as number[];
    filtered.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      hours[h]++;
    });
    const max = Math.max(...hours, 1);
    return hours.map((count, h) => ({ h, count, pct: (count / max) * 100 }));
  }, [filtered]);

  // Sales by day (last 14 days for chart)
  const salesByDay = useMemo(() => {
    const days: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      days[d.toDateString()] = 0;
    }
    filtered.forEach(o => {
      const k = new Date(o.createdAt).toDateString();
      if (k in days) days[k] += o.total;
    });
    const max = Math.max(...Object.values(days), 1);
    return Object.entries(days).map(([date, total]) => ({
      label: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total,
      pct: (total / max) * 100,
    }));
  }, [filtered]);

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
            <p className="text-gray-500 text-sm mt-1">{PERIOD_LABELS[period]}</p>
          </div>
          <button
            onClick={() => downloadCSV(filtered)}
            className="bg-stone-700 hover:bg-stone-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
          >
            Exportar CSV
          </button>
        </div>

        {/* Period selector */}
        <div className="flex flex-wrap gap-2">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                period === p
                  ? 'bg-amber-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total de pedidos', value: stats.total },
            { label: 'Retirados', value: stats.delivered },
            { label: 'Receita', value: fmt(stats.revenue) },
            { label: 'Ticket médio', value: fmt(stats.avgTicket) },
            { label: 'Cancelados', value: stats.cancelled },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <p className="text-2xl font-black text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h2>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sem dados para o período.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                    <span className="text-sm font-bold text-gray-400">{p.name.charAt(0)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium text-gray-700 truncate">{p.name}</span>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">{p.qty} un.</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-amber-500 h-1.5 rounded-full"
                          style={{ width: `${(p.qty / (topProducts[0]?.qty || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 shrink-0">{fmt(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Peak hours */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Horários de Maior Movimento</h2>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Sem dados para o período.</p>
            ) : (
              <div className="space-y-1">
                {peakHours
                  .filter(h => h.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 8)
                  .map(h => (
                    <div key={h.h} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-12 shrink-0">
                        {String(h.h).padStart(2, '0')}h
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-blue-400 h-2 rounded-full transition-all"
                          style={{ width: `${h.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8 text-right shrink-0">
                        {h.count}
                      </span>
                    </div>
                  ))}
                {filtered.length > 0 && peakHours.every(h => h.count === 0) && (
                  <p className="text-sm text-gray-400 text-center py-6">Sem pedidos no período.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sales by day */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Vendas por Dia (últimos 14 dias)</h2>
          {salesByDay.every(d => d.total === 0) ? (
            <p className="text-sm text-gray-400 text-center py-6">Sem dados para o período.</p>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {salesByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-amber-400 rounded-t-sm transition-all"
                    style={{ height: `${d.pct}%`, minHeight: d.total > 0 ? '4px' : '0' }}
                    title={`${d.label}: ${fmt(d.total)}`}
                  />
                  <span className="text-[9px] text-gray-400 rotate-45 origin-left">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
