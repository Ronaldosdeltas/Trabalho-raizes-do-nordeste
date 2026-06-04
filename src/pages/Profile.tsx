import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

export function Profile() {
  const { currentUser, logout, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const storedUser = currentUser ? authService.getUserById(currentUser.userId) : undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }

    const result = updateProfile({
      name: formData.name.trim(),
      email: formData.email,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword || undefined,
    });

    if (result.success) {
      setSuccessMsg('Perfil atualizado com sucesso!');
      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
    } else {
      setError(result.error ?? 'Erro ao atualizar perfil.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    deleteAccount();
    navigate('/');
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700 bg-white';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Cabeçalho do perfil */}
          <div className="bg-gradient-to-r from-amber-700 to-amber-500 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                <p className="text-amber-100 text-sm">{currentUser?.email}</p>
                {storedUser && (
                  <p className="text-amber-200 text-xs mt-1">
                    Membro desde {formatDate(storedUser.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {successMsg && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                ✅ {successMsg}
              </div>
            )}

            {/* Modo de visualização */}
            {!isEditing ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg">Meus Dados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Nome completo</p>
                    <p className="font-semibold text-gray-800">{currentUser?.name}</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">E-mail</p>
                    <p className="font-semibold text-gray-800 truncate">{currentUser?.email}</p>
                  </div>
                </div>
                {storedUser && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-1">Consentimento LGPD</p>
                    <p className="text-sm text-gray-700">
                      {storedUser.lgpdConsent
                        ? `✅ Consentimento registrado em ${formatDate(storedUser.createdAt)}`
                        : '⚠️ Consentimento não registrado'}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  ✏️ Editar Perfil
                </button>
              </div>
            ) : (
              /* Modo de edição */
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <h3 className="font-semibold text-gray-800 text-lg">Editar Informações</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    required
                    className={inputClass}
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-500 mb-3">
                    Nova senha — <span className="italic">deixe em branco para manter a atual</span>
                  </p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={e => setFormData(p => ({ ...p, newPassword: e.target.value }))}
                      autoComplete="new-password"
                      className={inputClass}
                      placeholder="Nova senha (mínimo 6 caracteres)"
                    />
                    <input
                      type="password"
                      value={formData.confirmNewPassword}
                      onChange={e => setFormData(p => ({ ...p, confirmNewPassword: e.target.value }))}
                      autoComplete="new-password"
                      className={inputClass}
                      placeholder="Confirmar nova senha"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-amber-800 mb-1">
                    🔒 Senha atual (obrigatório para salvar)
                  </label>
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={e => setFormData(p => ({ ...p, currentPassword: e.target.value }))}
                    required
                    autoComplete="current-password"
                    className={inputClass}
                    placeholder="Confirme sua senha atual"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    ⚠️ {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(false); setError(''); }}
                    className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            )}

            {/* Ações da conta */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                🚪 Sair da Conta
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full border border-red-200 text-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl transition-colors text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                🗑️ Solicitar Exclusão de Dados (LGPD)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de exclusão de conta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-6">
              <span className="text-5xl">⚠️</span>
              <h3 className="text-xl font-bold text-gray-800 mt-3">Excluir conta e dados</h3>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Conforme a <strong>LGPD (Lei nº 13.709/2018)</strong>, ao confirmar, todos os seus dados pessoais
                serão <strong>removidos permanentemente</strong> do sistema. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
              >
                Excluir Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
