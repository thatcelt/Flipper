import { RELATIVE_UNITS, CASINO_VARIANTS } from '../constants';
import type { CasinoKey, CasinoVariant } from '../types/canvas';

const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomElement = <T>(array: T[]): T => array[randomNumber(0, array.length - 1)]!;

export const cardDate = (): string => {
  const date = new Date();

  return `${String(date.getMonth() + 1).padStart(2, '0')}/${(date.getFullYear() + 4).toString().slice(2)}`;
};

export const cardNumber = (): string =>
  Array.from({ length: 4 }, () => randomNumber(1000, 9000).toString()).join(' ');

export const calculateLevel = (experience: number): { level: number; maxExperience: number } => {
  const level = Math.floor(Math.sqrt(Math.max(0, experience) / 100));

  return {
    level,
    maxExperience: 100 * Math.pow(level + 1, 2),
  };
};

export const getRelativeTime = (timestamp: number): string => {
  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });
  const difference = timestamp - Date.now();

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(difference) < ms * 60) {
      return rtf.format(Math.round(difference / ms), unit);
    }
  }

  return rtf.format(Math.round(difference / 86400000), 'day');
};

export const dailyReward = (): number => randomNumber(100, 500);

export const findUuid = (content: string): string[] | null =>
  content.match(/[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/gi);

export const casinoResult = (): CasinoKey =>
  Math.random() < 0.27 ? 'casino-casino-win' : 'casino-casino-lose';

export const casinoVariants = (key: CasinoKey): CasinoVariant[] => {
  if (key == 'casino-casino-win') {
    const variant = randomElement(CASINO_VARIANTS);
    return Array.from({ length: 3 }, () => variant);
  }

  return CASINO_VARIANTS.sort(() => Math.random() - 0.5).slice(0, 3);
};
