import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  lgpdConsent?: string;
}

export function Register() {
  const { register, currentUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');

  if (currentUser) return <Navigate to="/" replace />;

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (name.trim().length < 3) e.name = 'Nome deve ter ao menos 3 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'E-mail inválido.';
    if (password.length < 6) e.password = 'Senha deve ter ao menos 6 caracteres.';
    if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem.';
    if (!lgpdConsent) e.lgpdConsent = 'Você precisa aceitar os termos para continuar.';
    return e;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    const result = register({ name: name.trim(), email, password, lgpdConsent });
    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.error ?? 'Erro ao criar conta.');
    }
  };

  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700';

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🌵</span>
          <h1 className="text-2xl font-bold text-amber-800 mt-2">Criar Conta</h1>
          <p className="text-gray-500 text-sm mt-1">Junte-se ao Raízes do Nordeste</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              className={inputClass}
              placeholder="João da Silva"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              className={inputClass}
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
              placeholder="Repita a senha"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">⚠️ {errors.confirmPassword}</p>}
          </div>

          {/* LGPD Consent */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={lgpdConsent}
                onChange={e => setLgpdConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-amber-600 flex-shrink-0"
              />
              <span className="text-sm text-gray-700 leading-relaxed">
                Li e concordo com o tratamento dos meus dados pessoais conforme a{' '}
                <strong className="text-amber-700">Lei Geral de Proteção de Dados (LGPD)</strong>.
                Meus dados serão utilizados exclusivamente para a prestação dos serviços desta plataforma.
              </span>
            </label>
            {errors.lgpdConsent && <p className="text-red-500 text-xs mt-2">⚠️ {errors.lgpdConsent}</p>}
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span>⚠️</span> {serverError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
          >
            Criar Conta
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
