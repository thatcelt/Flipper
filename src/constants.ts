import { bold, code, italic } from 'karboai';
import type { Perk } from '../generated/prisma/enums';

import { main, sub } from '../public/data/commands.json';
import { works } from '../public/data/works.json';
import { frames, backgrounds, other } from '../public/data/shop.json';
import type { CasinoVariant, PerkKey } from './types/canvas';
import type { ClanFields } from './types/snippets';
import type { SubCommands, SubCommandUnion } from './types/constants';

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
  rob: 1500000,
  duel: 3600000,
  rep: 1500000,
  kiss: 1500000,
  sides: 43200000,
};

export const CHANGE_REP_MAP = {
  increment: 'повысили',
  decrement: 'понизили',
};

export const TOP_CATEGORIES = ['balance', 'duels', 'level', 'messages', 'reputation', 'robs'];

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

export const FLATTED_PRODUCTS = [...frames.flat(), ...backgrounds.flat(), ...other.flat()].reduce(
  (accumulator, currentItem) => {
    accumulator[currentItem.id] = currentItem;
    return accumulator;
  },
  {} as Record<number, (typeof frames)[0][0]>
);

export const FLATTED_CATEGORIES = {
  backgrounds: backgrounds.flat(),
  frames: frames.flat(),
  other: other.flat(),
  cards: frames.flat().filter((frame) => frame.thumbnail.includes('card')),
};

export const SHOP_CATEGORIES = ['backgrounds', 'frames', 'other'];

export const PERK_MAP: Record<Perk, PerkKey> = {
  DECK: 'deck-perk',
  ICE: 'ice-perk',
};

export const TIME = {
  day: 43200000,
};

export const CLAN_FIELDS: ClanFields[] = ['title', 'chatLink', 'icon'];

export const ALL_COMMANDS = main
  .map((command) => `${bold(command.name)} - ${italic(command.description)}\n`)
  .join('\n');

export const SUB_COMMANDS = sub.reduce((accumulator, currentItem) => {
  accumulator[currentItem.subKey as SubCommandUnion] = currentItem.commands
    .map((command) => `${bold(command.name)} - ${italic(command.description)}\n`)
    .join('\n');
  return accumulator;
}, {} as SubCommands);

export const PERK_TEXTS: Record<Perk, string> = {
  DECK: 'Экстра-бандл скриптов',
  ICE: 'Усиленный лёд',
};
