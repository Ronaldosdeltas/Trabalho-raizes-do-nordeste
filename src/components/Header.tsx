import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { totalItems } = useCart();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenu();
    navigate('/');
  }

  return (
    <>
      <header className="bg-amber-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div>
              <h1 className="text-xl font-bold leading-tight">Raízes do Nordeste</h1>
              <p className="text-amber-200 text-xs">Sabores autênticos do sertão</p>
            </div>
          </Link>

          {/* Nav central — desktop */}
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
                <Link to="/fidelidade" className="text-amber-100 hover:text-white text-sm font-medium transition-colors">
                  Fidelidade
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {/* Auth — desktop */}
            {currentUser ? (
              <>
                <Link
                  to="/perfil"
                  className="hidden md:flex items-center gap-2 text-amber-100 hover:text-white text-sm font-medium transition-colors"
                >
                  <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-28 truncate">{currentUser.name.split(' ')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden md:block text-amber-200 hover:text-white text-sm transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3">
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

            {/* Carrinho — sempre visível */}
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

            {/* Hamburguer — só mobile */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 hover:bg-amber-600 rounded-full transition-colors"
              aria-label="Abrir menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Drawer lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-amber-800 text-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cabeçalho do drawer */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-600">
          <span className="font-bold text-lg">Menu</span>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-amber-700 rounded-full transition-colors"
            aria-label="Fechar menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links do drawer */}
        <nav className="flex flex-col px-5 py-4 gap-1">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-100 hover:text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Início
          </Link>

          <Link
            to="/cardapio"
            onClick={closeMenu}
            className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-100 hover:text-white font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Cardápio
          </Link>

          {currentUser ? (
            <>
              <Link
                to="/pedidos"
                onClick={closeMenu}
                className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-100 hover:text-white font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Meus Pedidos
              </Link>

              <Link
                to="/fidelidade"
                onClick={closeMenu}
                className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-100 hover:text-white font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Fidelidade
              </Link>

              <div className="border-t border-amber-600 my-2" />

              <Link
                to="/perfil"
                onClick={closeMenu}
                className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-100 hover:text-white font-medium transition-colors"
              >
                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{currentUser.name.split(' ')[0]}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-200 hover:text-white font-medium transition-colors text-left w-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </>
          ) : (
            <>
              <div className="border-t border-amber-600 my-2" />

              <Link
                to="/login"
                onClick={closeMenu}
                className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-amber-700 text-amber-100 hover:text-white font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Entrar
              </Link>

              <Link
                to="/cadastro"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 mt-2 py-3 px-4 bg-white text-amber-700 hover:bg-amber-50 font-semibold rounded-xl transition-colors"
              >
                Criar Conta
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
}
