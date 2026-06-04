import type { LoyaltyProfile, PointsTransaction, LoyaltyLevel, Reward, LoyaltyCoupon } from '../types';

const LOYALTY_KEY = 'raizes_loyalty';
const LOYALTY_COUPONS_KEY = 'raizes_loyalty_coupons';

export const LEVEL_THRESHOLDS: Record<LoyaltyLevel, number> = {
  Bronze: 0,
  Prata: 1000,
  Ouro: 3000,
};

const LEVEL_MULTIPLIERS: Record<LoyaltyLevel, number> = {
  Bronze: 1,
  Prata: 1.5,
  Ouro: 2,
};

const BIRTHDAY_BONUS_POINTS: Record<LoyaltyLevel, number> = {
  Bronze: 50,
  Prata: 100,
  Ouro: 200,
};

const BIRTHDAY_COUPON_DISCOUNT: Record<LoyaltyLevel, number | null> = {
  Bronze: null,
  Prata: 10,
  Ouro: 20,
};

function recalcBalance(transactions: PointsTransaction[]): number {
  const now = new Date();
  return transactions.reduce((sum, tx) => {
    if (tx.type === 'redeemed') return sum + tx.points; // already negative
    if (tx.expiresAt && new Date(tx.expiresAt) < now) return sum; // expired, skip
    return sum + tx.points;
  }, 0);
}

export const loyaltyService = {
  getAllProfiles(): Record<string, LoyaltyProfile> {
    const data = localStorage.getItem(LOYALTY_KEY);
    return data ? (JSON.parse(data) as Record<string, LoyaltyProfile>) : {};
  },

  getProfile(userId: string): LoyaltyProfile {
    const all = this.getAllProfiles();
    return (
      all[userId] ?? {
        userId,
        balance: 0,
        lifetimePoints: 0,
        transactions: [],
        lastBirthdayBonusYear: null,
      }
    );
  },

  saveProfile(profile: LoyaltyProfile): void {
    const all = this.getAllProfiles();
    all[profile.userId] = profile;
    localStorage.setItem(LOYALTY_KEY, JSON.stringify(all));
  },

  getLevelForPoints(lifetimePoints: number): LoyaltyLevel {
    if (lifetimePoints >= LEVEL_THRESHOLDS.Ouro) return 'Ouro';
    if (lifetimePoints >= LEVEL_THRESHOLDS.Prata) return 'Prata';
    return 'Bronze';
  },

  getMultiplier(level: LoyaltyLevel): number {
    return LEVEL_MULTIPLIERS[level];
  },

  getNextLevelInfo(lifetimePoints: number): {
    nextLevel: LoyaltyLevel | null;
    pointsNeeded: number;
    progressPct: number;
  } {
    const level = this.getLevelForPoints(lifetimePoints);
    if (level === 'Ouro') {
      return { nextLevel: null, pointsNeeded: 0, progressPct: 100 };
    }
    if (level === 'Prata') {
      const span = LEVEL_THRESHOLDS.Ouro - LEVEL_THRESHOLDS.Prata;
      const progress = lifetimePoints - LEVEL_THRESHOLDS.Prata;
      return {
        nextLevel: 'Ouro',
        pointsNeeded: LEVEL_THRESHOLDS.Ouro - lifetimePoints,
        progressPct: Math.min(100, (progress / span) * 100),
      };
    }
    return {
      nextLevel: 'Prata',
      pointsNeeded: LEVEL_THRESHOLDS.Prata - lifetimePoints,
      progressPct: Math.min(100, (lifetimePoints / LEVEL_THRESHOLDS.Prata) * 100),
    };
  },

  // Called by CartContext on checkout
  awardOrderPoints(userId: string, orderId: string, orderTotal: number): number {
    const profile = this.getProfile(userId);
    const level = this.getLevelForPoints(profile.lifetimePoints);
    const earnedPoints = Math.floor(Math.floor(orderTotal) * LEVEL_MULTIPLIERS[level]);
    if (earnedPoints <= 0) return 0;

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const tx: PointsTransaction = {
      id: crypto.randomUUID(),
      type: 'earned',
      points: earnedPoints,
      description: `Pedido #${orderId.slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      orderId,
    };

    const transactions = [...profile.transactions, tx];
    this.saveProfile({
      ...profile,
      transactions,
      lifetimePoints: profile.lifetimePoints + earnedPoints,
      balance: recalcBalance(transactions),
    });
    return earnedPoints;
  },

  redeemReward(
    userId: string,
    reward: Reward,
  ): { success: boolean; error?: string; couponCode?: string } {
    const profile = this.getProfile(userId);
    if (profile.balance < reward.pointsCost) {
      return { success: false, error: 'Saldo insuficiente para resgatar esta recompensa.' };
    }

    const tx: PointsTransaction = {
      id: crypto.randomUUID(),
      type: 'redeemed',
      points: -reward.pointsCost,
      description: `Resgate: ${reward.name}`,
      createdAt: new Date().toISOString(),
    };

    const transactions = [...profile.transactions, tx];
    this.saveProfile({
      ...profile,
      transactions,
      balance: recalcBalance(transactions),
    });

    // Generate coupon
    const code = `FIDELIDADE${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const couponValue = reward.value ?? 15;
    this.saveLoyaltyCoupon({
      code,
      type: 'fixed',
      value: couponValue,
      description: reward.name,
      minOrder: reward.type === 'discount' && couponValue >= 10 ? couponValue * 3 : undefined,
      userId,
      expiresAt: expiresAt.toISOString(),
    });

    return { success: true, couponCode: code };
  },

  checkAndGrantBirthdayBonus(
    userId: string,
    birthDate: string,
  ): { granted: boolean; points?: number; couponCode?: string; level?: LoyaltyLevel } {
    const profile = this.getProfile(userId);
    const today = new Date();
    const currentYear = today.getFullYear();

    if (profile.lastBirthdayBonusYear === currentYear) return { granted: false };

    const birth = new Date(birthDate + 'T00:00:00');
    const birthdayThisYear = new Date(currentYear, birth.getMonth(), birth.getDate());
    const diffDays = (today.getTime() - birthdayThisYear.getTime()) / (1000 * 60 * 60 * 24);

    // Active during the birthday week (day 0 to day 6)
    if (diffDays < 0 || diffDays >= 7) return { granted: false };

    const level = this.getLevelForPoints(profile.lifetimePoints);
    const bonusPoints = BIRTHDAY_BONUS_POINTS[level];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const tx: PointsTransaction = {
      id: crypto.randomUUID(),
      type: 'bonus',
      points: bonusPoints,
      description: 'Bônus de Aniversário',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const transactions = [...profile.transactions, tx];
    this.saveProfile({
      ...profile,
      transactions,
      lifetimePoints: profile.lifetimePoints + bonusPoints,
      balance: recalcBalance(transactions),
      lastBirthdayBonusYear: currentYear,
    });

    // Prata and Ouro also get a percentage discount coupon
    const discountPct = BIRTHDAY_COUPON_DISCOUNT[level];
    let couponCode: string | undefined;
    if (discountPct !== null) {
      couponCode = `ANIVER${currentYear}${userId.slice(0, 4).toUpperCase()}`;
      const couponExpiresAt = new Date();
      couponExpiresAt.setDate(couponExpiresAt.getDate() + 7);
      this.saveLoyaltyCoupon({
        code: couponCode,
        type: 'percentage',
        value: discountPct,
        description: `Cupom de Aniversário ${discountPct}% OFF`,
        userId,
        expiresAt: couponExpiresAt.toISOString(),
      });
    }

    return { granted: true, points: bonusPoints, couponCode, level };
  },

  // Loyalty coupons storage
  getAllLoyaltyCoupons(): LoyaltyCoupon[] {
    const data = localStorage.getItem(LOYALTY_COUPONS_KEY);
    return data ? (JSON.parse(data) as LoyaltyCoupon[]) : [];
  },

  saveLoyaltyCoupon(coupon: LoyaltyCoupon): void {
    const all = this.getAllLoyaltyCoupons();
    all.push(coupon);
    localStorage.setItem(LOYALTY_COUPONS_KEY, JSON.stringify(all));
  },

  getLoyaltyCouponByCode(code: string): LoyaltyCoupon | undefined {
    return this.getAllLoyaltyCoupons().find(
      c => c.code.toUpperCase() === code.toUpperCase(),
    );
  },

  markLoyaltyCouponUsed(code: string): void {
    const all = this.getAllLoyaltyCoupons().map(c =>
      c.code.toUpperCase() === code.toUpperCase()
        ? { ...c, usedAt: new Date().toISOString() }
        : c,
    );
    localStorage.setItem(LOYALTY_COUPONS_KEY, JSON.stringify(all));
  },
};
