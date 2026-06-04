import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { totalItems } = useCart();
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-amber-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <span className="text-3xl">🌵</span>
          <div>
            <h1 className="text-xl font-bold leading-tight">Raízes do Nordeste</h1>
            <p className="text-amber-200 text-xs">Sabores autênticos do sertão</p>
          </div>
        </Link>

        {/* Nav central */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-amber-100 hover:text-white text-sm font-medium transition-colors">
            Início
          </Link>
          <Link to="/cardapio" className="text-amber-100 hover:text-white text-sm font-medium transition-colors">
            Cardápio
          </Link>
          {currentUser && (
            <>
              <Link to="/pedidos" className="text-amber-100 hover:text-white text-sm font-medium transition-colors">
                Meus Pedidos
              </Link>
              <Link to="/fidelidade" className="text-amber-100 hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
                <span>⭐</span> Fidelidade
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <Link
                to="/perfil"
                className="hidden sm:flex items-center gap-2 text-amber-100 hover:text-white text-sm font-medium transition-colors"
              >
                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-28 truncate">{currentUser.name.split(' ')[0]}</span>
              </Link>
              <button
                onClick={logout}
                className="hidden sm:block text-amber-200 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Sair
              </button>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login" className="text-amber-100 hover:text-white text-sm font-medium transition-colors">
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="bg-white text-amber-700 hover:bg-amber-50 text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Criar Conta
              </Link>
            </div>
          )}

          <Link
            to="/cart"
            className="relative p-2 hover:bg-amber-600 rounded-full transition-colors"
            aria-label="Ver carrinho"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
