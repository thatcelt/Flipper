import type { Perk } from '../../generated/prisma/enums';
import type { DuelHistoryElement, PerkKey } from './canvas';

export type DuelUser = {
  id: string;
  nickname: string;
  health: number;
  avatar: string;
  perk?: Perk | null;
  stats: {
    deck: number;
    ice: number;
  };
};

export type Duel = {
  id: string;
  users: DuelUser[];
  history: DuelHistoryElement[];
  turn: string;
  isFinished: boolean;
};
