import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';

export function AdminLogin() {
  const { currentAdmin, login } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (currentAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error ?? 'Erro ao autenticar.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-stone-800">Área Administrativa</h1>
          <p className="text-gray-500 text-sm mt-1">Raízes do Nordeste</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
              placeholder="admin@raizes.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 bg-stone-50 rounded-xl p-4 text-xs text-stone-500 space-y-1">
          <p className="font-semibold text-stone-600 mb-2">Contas de demonstração:</p>
          <p>Admin: <span className="font-mono">admin@raizes.com</span> / <span className="font-mono">admin123</span></p>
          <p>Gerente: <span className="font-mono">gerente@fortaleza.com</span> / <span className="font-mono">gerente123</span></p>
        </div>
      </div>
    </div>
  );
}
