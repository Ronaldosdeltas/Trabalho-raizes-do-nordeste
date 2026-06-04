import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LoyaltyProfile, LoyaltyLevel, Reward } from '../types';
import { loyaltyService, LEVEL_THRESHOLDS } from '../services/loyaltyService';
import { useAuth } from './AuthContext';
import { authService } from '../services/authService';

interface BirthdayBonusResult {
  granted: boolean;
  points?: number;
  couponCode?: string;
  level?: LoyaltyLevel;
}

interface LoyaltyContextType {
  profile: LoyaltyProfile | null;
  level: LoyaltyLevel;
  nextLevelInfo: { nextLevel: LoyaltyLevel | null; pointsNeeded: number; progressPct: number };
  birthdayBonusResult: BirthdayBonusResult | null;
  redeemReward: (reward: Reward) => { success: boolean; error?: string; couponCode?: string };
  refreshProfile: () => void;
}

const LoyaltyContext = createContext<LoyaltyContextType | null>(null);

export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [birthdayBonusResult, setBirthdayBonusResult] = useState<BirthdayBonusResult | null>(null);

  const loadProfile = useCallback(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    setProfile(loyaltyService.getProfile(currentUser.userId));
  }, [currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Check birthday bonus whenever the user session changes
  useEffect(() => {
    if (!currentUser) {
      setBirthdayBonusResult(null);
      return;
    }
    const user = authService.getUserById(currentUser.userId);
    if (!user?.birthDate) return;

    const result = loyaltyService.checkAndGrantBirthdayBonus(currentUser.userId, user.birthDate);
    if (result.granted) {
      setBirthdayBonusResult(result);
      loadProfile();
    }
  }, [currentUser, loadProfile]);

  const level = profile ? loyaltyService.getLevelForPoints(profile.lifetimePoints) : 'Bronze';

  const nextLevelInfo = profile
    ? loyaltyService.getNextLevelInfo(profile.lifetimePoints)
    : { nextLevel: 'Prata' as LoyaltyLevel, pointsNeeded: LEVEL_THRESHOLDS.Prata, progressPct: 0 };

  const redeemReward = (reward: Reward) => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado.' };
    const result = loyaltyService.redeemReward(currentUser.userId, reward);
    if (result.success) loadProfile();
    return result;
  };

  return (
    <LoyaltyContext.Provider
      value={{ profile, level, nextLevelInfo, birthdayBonusResult, redeemReward, refreshProfile: loadProfile }}
    >
      {children}
    </LoyaltyContext.Provider>
  );
}

export function useLoyalty() {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyalty must be used within LoyaltyProvider');
  return ctx;
}
