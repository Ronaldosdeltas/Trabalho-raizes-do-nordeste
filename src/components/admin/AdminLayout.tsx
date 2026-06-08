import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import type { ReactNode } from 'react';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/produtos',  label: 'Produtos'   },
  { to: '/admin/pedidos',   label: 'Pedidos'    },
  { to: '/admin/relatorios', label: 'Relatórios' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { currentAdmin, logout } = useAdmin();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const roleLabel = currentAdmin?.role === 'admin' ? 'Administrador' : 'Gerente';

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-stone-900 text-white flex flex-col shrink-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-stone-700">
          <div className="flex items-center gap-2">
            <div>
              <p className="font-bold text-sm leading-tight">Raízes do Nordeste</p>
              <p className="text-stone-400 text-xs">Área Administrativa</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-amber-600 text-white'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-stone-700">
          <p className="text-xs text-stone-400 mb-0.5">{roleLabel}</p>
          <p className="text-sm font-semibold text-white truncate">{currentAdmin?.name}</p>
          {currentAdmin?.unitId && (
            <p className="text-xs text-amber-400 capitalize mt-0.5">{currentAdmin.unitId}</p>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-xs text-stone-400 hover:text-white transition-colors text-left cursor-pointer"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
