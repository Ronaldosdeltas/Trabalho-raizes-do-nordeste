import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { rewards } from '../data/rewards';
import type { LoyaltyLevel, Reward } from '../types';

type LevelConfig = {
  color: string;
  bg: string;
  border: string;
  barColor: string;
  badgeBg: string;
  badgeText: string;
  emoji: string;
  multiplier: string;
  range: string;
  benefits: string[];
};

const LEVEL_CONFIG: Record<LoyaltyLevel, LevelConfig> = {
  Bronze: {
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    barColor: 'bg-amber-500',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    emoji: '',
    multiplier: '1×',
    range: '0 – 999 pts',
    benefits: [
      '1 ponto por R$1 gasto',
      'Acesso ao catálogo de recompensas',
      'Bônus de aniversário (50 pts)',
    ],
  },
  Prata: {
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-300',
    barColor: 'bg-slate-400',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    emoji: '',
    multiplier: '1,5×',
    range: '1.000 – 2.999 pts',
    benefits: [
      '1,5 pontos por R$1 gasto',
      'Cupom de aniversário 10% OFF',
      'Bônus de aniversário (100 pts)',
      'Acesso prioritário a promoções',
    ],
  },
  Ouro: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    barColor: 'bg-yellow-400',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-700',
    emoji: '',
    multiplier: '2×',
    range: '3.000+ pts',
    benefits: [
      '2 pontos por R$1 gasto',
      'Cupom de aniversário 20% OFF',
      'Bônus de aniversário (200 pts)',
      'Frete grátis em todos os pedidos',
      'Atendimento VIP',
    ],
  },
};

export function Fidelidade() {
  const { profile, level, nextLevelInfo, birthdayBonusResult, redeemReward, refreshProfile } =
    useLoyalty();

  const [redeemedInfo, setRedeemedInfo] = useState<{ name: string; code: string } | null>(null);
  const [redeemError, setRedeemError] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const handleRedeem = (reward: Reward) => {
    if (!window.confirm(`Deseja resgatar "${reward.name}" por ${reward.pointsCost} pontos?`)) return;
    setRedeemError('');
    setRedeemedInfo(null);
    const result = redeemReward(reward);
    if (result.success && result.couponCode) {
      setRedeemedInfo({ name: reward.name, code: result.couponCode });
    } else if (!result.success) {
      setRedeemError(result.error ?? 'Erro ao resgatar recompensa.');
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const cfg = LEVEL_CONFIG[level];
  const nextCfg = nextLevelInfo.nextLevel ? LEVEL_CONFIG[nextLevelInfo.nextLevel] : null;
  const recentTransactions = [...(profile?.transactions ?? [])].reverse().slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-amber-800">Programa de Fidelidade</h1>
          <p className="text-gray-500 text-sm mt-1">
            Acumule pontos, suba de nível e resgate recompensas exclusivas.
          </p>
        </div>

        {/* Birthday bonus banner */}
        {birthdayBonusResult?.granted && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold">Feliz Aniversário!</h2>
                <p className="text-pink-100 mt-1">
                  Você ganhou{' '}
                  <strong className="text-white">{birthdayBonusResult.points} pontos</strong> de
                  bônus de aniversário!
                </p>
                {birthdayBonusResult.couponCode && (
                  <div className="mt-4">
                    <p className="text-pink-100 text-sm mb-2">Seu cupom exclusivo de aniversário:</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="bg-white/20 border border-white/40 px-4 py-2 rounded-xl font-mono font-bold text-lg tracking-widest">
                        {birthdayBonusResult.couponCode}
                      </span>
                      <button
                        onClick={() => copyToClipboard(birthdayBonusResult.couponCode!)}
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                      >
                        {copiedCode === birthdayBonusResult.couponCode ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-pink-200 text-xs mt-2">Válido por 7 dias. Use no carrinho!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Level card */}
        <div className={`${cfg.bg} border-2 ${cfg.border} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                    Nível atual
                  </p>
                  <h2 className={`text-3xl font-extrabold ${cfg.color}`}>{level}</h2>
                </div>
              </div>

              <div className="flex gap-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Saldo disponível</p>
                  <p className="text-4xl font-black text-gray-800">{profile?.balance ?? 0}</p>
                  <p className="text-xs text-gray-400">pontos</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Acumulados</p>
                  <p className="text-2xl font-bold text-gray-600">{profile?.lifetimePoints ?? 0}</p>
                  <p className="text-xs text-gray-400">pontos históricos</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Multiplicador</p>
              <span className={`text-4xl font-black ${cfg.color}`}>{cfg.multiplier}</span>
            </div>
          </div>

          {/* Progress bar */}
          {nextLevelInfo.nextLevel && nextCfg && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  Progresso para {nextLevelInfo.nextLevel}
                </span>
                <span className="text-sm text-gray-500">
                  Faltam {nextLevelInfo.pointsNeeded} pts
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`${cfg.barColor} h-3 rounded-full transition-all duration-700`}
                  style={{ width: `${nextLevelInfo.progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{level}</span>
                <span>{nextLevelInfo.nextLevel}</span>
              </div>
            </div>
          )}

          {level === 'Ouro' && (
            <div className="mt-4 flex items-center gap-2 text-yellow-700 bg-yellow-100 rounded-xl px-4 py-2 text-sm font-semibold">
              Você atingiu o nível máximo! Parabéns!
            </div>
          )}

          {/* Current level benefits */}
          <div className="mt-5 pt-5 border-t border-black/10">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Benefícios do nível {level}:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
              {cfg.benefits.map(benefit => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Rewards catalog */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-1">Catálogo de Recompensas</h2>
          <p className="text-sm text-gray-500 mb-4">
            Troque seus pontos por cupons e produtos. O código gerado pode ser usado no carrinho.
          </p>

          {redeemError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
              {redeemError}
            </div>
          )}

          {redeemedInfo && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="font-semibold text-green-800">
                {redeemedInfo.name} resgatado com sucesso!
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="bg-green-100 border border-green-300 px-4 py-2 rounded-xl font-mono font-bold text-green-800 tracking-widest">
                  {redeemedInfo.code}
                </span>
                <button
                  onClick={() => copyToClipboard(redeemedInfo.code)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                >
                  {copiedCode === redeemedInfo.code ? 'Copiado!' : 'Copiar código'}
                </button>
              </div>
              <p className="text-green-600 text-xs mt-2">
                Válido por 30 dias. Cole este código no campo de cupom do carrinho.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => {
              const balance = profile?.balance ?? 0;
              const canRedeem = balance >= reward.pointsCost;
              const missing = reward.pointsCost - balance;
              return (
                <div
                  key={reward.id}
                  className={`bg-white rounded-2xl border-2 p-5 flex flex-col gap-3 shadow-sm transition-all ${
                    canRedeem
                      ? 'border-amber-200 hover:shadow-md hover:-translate-y-0.5'
                      : 'border-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                      <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        canRedeem ? cfg.badgeBg + ' ' + cfg.badgeText : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {reward.pointsCost} pts
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{reward.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{reward.description}</p>
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canRedeem}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      canRedeem
                        ? 'bg-amber-600 hover:bg-amber-700 text-white cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canRedeem ? 'Resgatar' : `Faltam ${missing} pts`}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Transaction history */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Histórico de Pontos</h2>
          {recentTransactions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <p className="text-gray-500 font-medium">Nenhuma movimentação ainda.</p>
              <p className="text-sm text-gray-400 mt-1">
                Faça um pedido para começar a acumular pontos!
              </p>
              <Link
                to="/cardapio"
                className="inline-block mt-5 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Ver Cardápio
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Data
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Descrição
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Pontos
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">
                        Validade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentTransactions.map(tx => {
                      const isPositive = tx.points > 0;
                      const isExpired = tx.expiresAt && new Date(tx.expiresAt) < new Date();
                      return (
                        <tr
                          key={tx.id}
                          className={`hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-40' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  tx.type === 'earned'
                                    ? 'bg-green-100 text-green-700'
                                    : tx.type === 'bonus'
                                      ? 'bg-pink-100 text-pink-700'
                                      : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {tx.type === 'earned'
                                  ? 'Ganho'
                                  : tx.type === 'bonus'
                                    ? 'Bônus'
                                    : 'Resgate'}
                              </span>
                              <span>{tx.description}</span>
                              {isExpired && (
                                <span className="text-xs text-red-400">(expirado)</span>
                              )}
                            </div>
                          </td>
                          <td
                            className={`px-4 py-3 text-sm font-bold text-right ${
                              isPositive ? 'text-green-600' : 'text-red-500'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {tx.points}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400 text-right hidden sm:table-cell whitespace-nowrap">
                            {tx.expiresAt ? formatDate(tx.expiresAt) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Level comparison */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Níveis de Fidelidade</h2>
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {(['Bronze', 'Prata', 'Ouro'] as LoyaltyLevel[]).map(lvl => {
              const c = LEVEL_CONFIG[lvl];
              const isCurrent = lvl === level;
              return (
                <div
                  key={lvl}
                  className={`${c.bg} border-2 rounded-2xl p-3 sm:p-5 transition-shadow ${
                    isCurrent ? `${c.border} shadow-md` : 'border-transparent'
                  }`}
                >
                  <div className="text-center mb-3">
                    <h3 className={`font-bold text-base sm:text-lg ${c.color}`}>{lvl}</h3>
                    {isCurrent && (
                      <span className="inline-block text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-medium mt-1">
                        Seu nível
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{c.range}</p>
                    <p className={`text-lg font-black mt-1 ${c.color}`}>{c.multiplier}</p>
                  </div>
                  <ul className="space-y-1.5">
                    {c.benefits.map(b => (
                      <li key={b} className="text-xs text-gray-600">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
