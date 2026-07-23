import { code, type User } from 'karboai';

import { RELATIVE_UNITS, CASINO_VARIANTS } from '../constants';
import type { CasinoKey, CasinoVariant } from '../types/canvas';
import type { TopUser } from '../types/prisma';

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

export const isCasinoWon = (): CasinoKey =>
  Math.random() < 0.27 ? 'casino-casino-win' : 'casino-casino-lose';

export const casinoVariants = (key: CasinoKey): CasinoVariant[] => {
  if (key == 'casino-casino-win') {
    const variant = randomElement(CASINO_VARIANTS);
    return Array.from({ length: 3 }, () => variant);
  }

  return CASINO_VARIANTS.sort(() => Math.random() - 0.5).slice(0, 3);
};

export const isRobbed = (): boolean => Math.random() > 0.29;

export const robReward = (maxCash: number): number =>
  randomNumber(Math.min(50, maxCash), Math.min(300, maxCash));

export const decrementReputation = (): number => randomNumber(5, 12);

export const robLog = (result: boolean, reward: number, reputationDecrease: number): string =>
  result
    ? `Вы успешно украли ${code(reward.toString())} фликов у неряшливого пользователя!`
    : `Вас поймали на краже! Вы потеряли ${code(reputationDecrease.toString())} репутации!`;

export const parseValue = (user: TopUser, category: string): number => {
  if (category == 'balance') return user.card!.balance;

  return category == 'level'
    ? calculateLevel(user.stats!.experience).level
    : Number(user.stats![category as keyof typeof user.stats]); // fuck these types
};

export const truncate = (value: string) => (value.length > 10 ? `${value.slice(0, 10)}...` : value);

export const getAvatarUrl = (raw: string) =>
  !raw.includes('static') ? `https://api.karboai.com/static/images/${raw}` : raw;

export const randomUser = (users: User[]): User => users[Math.floor(Math.random() * users.length)]!;

export const duelReward = (): { reputation: number; balance: number } => ({
  reputation: randomNumber(5, 10),
  balance: randomNumber(100, 400),
});

export const geHackAndtSacrifice = (): number => randomNumber(200, 600);

export const getCrimeAndRescue = (): number => randomNumber(5, 10);
