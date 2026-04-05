import { DotsMap } from './schemas/canvas';

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
