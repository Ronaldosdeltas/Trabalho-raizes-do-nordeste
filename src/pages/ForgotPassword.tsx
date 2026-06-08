import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Step = 'email' | 'code' | 'success';

export function ForgotPassword() {
  const { requestPasswordReset, resetPassword } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [simulatedCode, setSimulatedCode] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700';

  const handleEmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const result = requestPasswordReset(email);
    if (result.success && result.code) {
      setSimulatedCode(result.code);
      setStep('code');
    } else {
      setError(result.error ?? 'Erro ao processar solicitação.');
    }
  };

  const handleResetSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    const result = resetPassword(email, code, newPassword);
    if (result.success) {
      setStep('success');
    } else {
      setError(result.error ?? 'Erro ao redefinir senha.');
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-amber-800 mt-2">Recuperar Senha</h1>
        </div>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-gray-500 text-sm text-center">
              Informe seu e-mail cadastrado. Enviaremos um código de verificação.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
                placeholder="seu@email.com"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">
              Enviar Código
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {/* Código simulado exibido na tela */}
            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 mb-1">Código enviado para <strong>{email}</strong> (simulado):</p>
              <p className="text-4xl font-bold text-amber-700 tracking-[0.3em] mt-2">{simulatedCode}</p>
              <p className="text-xs text-gray-400 mt-2">Válido por 15 minutos</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Digite o código recebido</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className={`${inputClass} text-center tracking-[0.3em] text-xl font-bold`}
                placeholder="000000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputClass}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={inputClass}
                placeholder="Repita a nova senha"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer">
              Redefinir Senha
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <p className="text-xl font-bold text-green-700">Senha redefinida!</p>
            <p className="text-gray-500 text-sm">Você já pode entrar com sua nova senha.</p>
            <Link
              to="/login"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Ir para o Login
            </Link>
          </div>
        )}

        {step !== 'success' && (
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-amber-600 hover:text-amber-700 font-semibold">
              ← Voltar ao login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
