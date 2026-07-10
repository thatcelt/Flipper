import { bold, code, italic } from 'karboai';
import { works } from '../public/data/works.json';
import type { CasinoVariant } from './types/canvas';

export const DEFAULT_WORK = 'Безработный';
export const BOT_PREFIX = '/';

export const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['second', 1000],
  ['minute', 60000],
  ['hour', 3600000],
  ['day', 86400000],
];

export const COOLDOWNS = {
  daily: 86400000,
  work: 43200000,
};

export const CASINO_VARIANTS: CasinoVariant[] = [
  'casino-green-dork',
  'casino-green-love',
  'casino-purple-dork',
  'casino-purple-love',
];

export const WORKS_RECORD = works.reduce(
  (accumulator, currentItem) => {
    accumulator[currentItem.workId] = currentItem.metadata;
    return accumulator;
  },
  {} as Record<number, { name: string; salary: number; minReputation: number }>
);

export const WORKS_STRING = `${bold('Доступные работы:')}\n\n${works
  .map(
    (work) =>
      `${italic(bold(work.metadata.name))} [ID: ${code(work.workId.toString())}]\nМинимум репутации: ${italic(work.metadata.minReputation.toString())}\nЗарплата: ${italic(work.metadata.salary.toString())}\n`
  )
  .join('\n')}`;

export const SHOP_CATEGORIES = ['backgrounds', 'frames', 'other'];
