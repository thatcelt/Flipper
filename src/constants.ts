import { DotsMap, TopMap } from './schemas/canvas';
import { main } from '../public/data/commands.json';
import { bold, italic } from 'karboai';

export const COLORS = {
  white: '#FFFFFF',
  orange: '#99580A',
  red: '#990a0a',
  blue: '#0a4399',
  green: '#43990a',
  yellow: '#99780a',
  pink: '#990a92',
  purple: '#600a99',
};

export const CLAN_DOTS: Record<string, DotsMap[]> = {
  messages: [
    { x: 146, y: 333 },
    { x: 305, y: 323 },
    { x: 465, y: 333 },
  ],
  experience: [
    { x: 146, y: 546 },
    { x: 305, y: 536 },
    { x: 465, y: 546 },
  ],
};

export const TOP_HORIZONAL_MAP: Record<TopMap, number> = {
  'top-messages': 321,
  'top-balance': 287,
  'top-duels': 380,
  'top-robs': 350,
};

export const TOP_DOTS: Record<string, DotsMap[]> = {
  winners: [
    { x: 151, y: 141 },
    { x: 305, y: 131 },
    { x: 459, y: 141 },
  ],
  secondary: [
    { x: 73, y: 333 },
    { x: 73, y: 459 },
    { x: 73, y: 585 },
  ],
  winnersMeta: [
    { x: 151, y: 251 },
    { x: 305, y: 242 },
    { x: 459, y: 251 },
  ],
};

export const ALL_COMMANDS = main
  .map((command) => `${bold(command.name)} - ${italic(command.description)}\n`)
  .join('\n');
