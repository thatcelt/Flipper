import _ from 'lodash';

import { CUTOFF_TIME } from '../constants';
import {
  casinoVariantsList,
  relativeUnits,
  mediaBaseUrl,
  uniqueProducts,
} from '../../public/data/constants.json';
import { CasinoType, CasinoVariant, GambleType } from '../schemas/canvas';
import { UserOrderByWithRelationInput } from '../../generated/prisma/models';

const getDeepKeys = (obj: Partial<Record<string, unknown>>): string => {
  const key = Object.keys(obj)[0];
  const value = obj[key];

  if (value && !Array.isArray(value)) {
    return `${key}.${getDeepKeys(value)}`;
  }

  return key;
};

export const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateCardDate = (): string => {
  const date = new Date();

  return `${String(date.getMonth() + 1).padStart(2, '0')}/${(date.getFullYear() + 4).toString().slice(2)}`;
};

export const generateCardNumber = (): string =>
  Array.from({ length: 4 }, () =>
    Math.floor(1000 + Math.random() * 9000).toString(),
  ).join(' ');

export const delay = async (seconds: number) =>
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));

export const level = (experience: number) => {
  const safeExperience = Math.max(0, experience);
  const level = Math.floor(Math.sqrt(safeExperience / 100));

  return {
    level,
    maxExperience: 100 * Math.pow(level + 1, 2),
  };
};

export const getRelative = (deltaMs: number): string => {
  const deltaSeconds = Math.round(deltaMs / 1000);

  const unitIndex = CUTOFF_TIME.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds),
  );
  const value = Math.round(
    deltaSeconds / (unitIndex === 0 ? 1 : CUTOFF_TIME[unitIndex - 1]),
  );

  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });

  return rtf.format(
    value,
    (relativeUnits as Intl.RelativeTimeFormatUnit[])[unitIndex],
  );
};

export const generateDaily = (): number => randomNumber(250, 350);

export const getCasinoType = (): CasinoType =>
  Math.random() < 0.35 ? 'casino-win' : 'casino-lose';

export const generateCasinoVariants = (isWon: boolean): CasinoVariant[] => {
  if (isWon) {
    const winVariant =
      casinoVariantsList[Math.floor(Math.random() * casinoVariantsList.length)];

    return Array.from({ length: 3 }, () => winVariant) as CasinoVariant[];
  }

  return casinoVariantsList
    .sort(() => Math.random() - 0.5)
    .slice(0, 3) as CasinoVariant[];
};

export const getChangingExpression = (type: GambleType, value: number) => {
  const expressions = {
    won: { increment: value },
    lose: { decrement: value },
  };

  return expressions[type];
};

export const findUuid = (content: string): string[] | null =>
  content.match(
    /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/gi,
  );

export const numberWithTax = (value: number): number => Math.floor(value * 0.8);

export const isFlipWon = (): boolean => Math.random() > 0.5;

export const generateRepReward = (): number => randomNumber(5, 10);

export const isRobbed = (): boolean => Math.random() > 0.35;

export const generateRobReward = (): number => randomNumber(100, 200);

export const generateReputationDecrease = (): number => randomNumber(5, 10);

export const isDuelWon = (): boolean => Math.random() > 0.4;

export const randomElement = <T>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const generateDuelReward = (): number => randomNumber(3, 10);

export const getOrderBy = (category: string): UserOrderByWithRelationInput => {
  if (category == 'balance') return { card: { balance: 'desc' } };

  return { stats: { [category]: 'desc' } };
};

export const truncate = (name: string) =>
  name.length > 10 ? `${name.slice(0, 10)}...` : name;

export const getAvatarUrl = (path: string): string =>
  !path.includes('karbo') ? `${mediaBaseUrl}${path}` : path;

export const getAddQuery = (
  query: Partial<Record<string, unknown>>,
  value: number,
) => {
  _.set(query, getDeepKeys(query), value);

  return JSON.parse(
    JSON.stringify(query).replace(`{"undefined":${value}}`, value.toString()),
  );
};

export const isCoupleStreakEnded = (lastKissAt: number): boolean =>
  Date.now() - lastKissAt >= 43200000;

export const isFrameForCouple = (frameId: number): boolean =>
  uniqueProducts.coupleFrameIds.includes(frameId);

export const isBackgroundForCouple = (backgroundId: number): boolean =>
  uniqueProducts.coupleBackgroundIds.includes(backgroundId);
