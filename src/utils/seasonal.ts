import type { SeasonalInfo } from '../types';

export function isSeasonalActive(seasonal: SeasonalInfo): boolean {
  const now = new Date();
  const current = (now.getMonth() + 1) * 100 + now.getDate();
  const [sm, sd] = seasonal.start.split('-').map(Number);
  const [em, ed] = seasonal.end.split('-').map(Number);
  const start = sm * 100 + sd;
  const end = em * 100 + ed;

  // Handles ranges that cross the year boundary (e.g., Dec 15 – Jan 10)
  if (start <= end) {
    return current >= start && current <= end;
  }
  return current >= start || current <= end;
}
