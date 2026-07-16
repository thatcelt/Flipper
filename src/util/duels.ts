import { randomUUID } from 'crypto';

import type { Duel, DuelUser } from '../types/duels';
import type { DuelHistoryElement } from '../types/canvas';

export const DUELS_CACHE = new Map<string, Duel>();

const changeStat = (
  id: string,
  userId: string,
  stat: 'deck' | 'ice' | 'health',
  changing: 'increment' | 'decrement'
): void => {
  const duel = DUELS_CACHE.get(id);

  if (duel) {
    const user = duel.users.find((user) => user.id === userId);

    if (user && stat != 'health') {
      changing == 'decrement' ? (user.stats[stat] -= 1) : (user.stats[stat] += 1);
    } else {
      changing == 'decrement' ? (user!.health -= 1) : (user!.health += 1);
    }
  }
};

export const createDuel = (users: Omit<DuelUser, 'health'>[], turn: string): Duel => {
  const duel = {
    id: randomUUID(),
    users: users.map((user) => ({ ...user, health: 4 })),
    turn,
    history: [],
    isFinished: false,
  };

  DUELS_CACHE.set(duel.id, duel);

  return duel;
};

export const deleteDuel = (duelId: string): void => {
  DUELS_CACHE.delete(duelId);
};

export const setTurn = (duelId: string, turn: string): void => {
  const duel = DUELS_CACHE.get(duelId);

  if (duel) {
    duel.turn = turn;
  }
};

export const incrementDeck = (duelId: string, userId: string): void =>
  changeStat(duelId, userId, 'deck', 'increment');

export const incrementIce = (duelId: string, userId: string): void =>
  changeStat(duelId, userId, 'ice', 'increment');

export const decrementHealth = (duelId: string, userId: string): void =>
  changeStat(duelId, userId, 'health', 'decrement');

export const getDuel = (duelId?: string): Duel | undefined =>
  duelId ? DUELS_CACHE.get(duelId) : undefined;

export const inDuel = (userId: string): boolean =>
  DUELS_CACHE.entries().some(([_, duel]) => duel.users.some((user) => user.id === userId));

export const writeToHistory = (duelId: string, element: DuelHistoryElement): void => {
  const duel = DUELS_CACHE.get(duelId);

  if (duel) {
    duel.history.push(element);
  }
};

export const finishDuel = (duelId: string): void => {
  const duel = DUELS_CACHE.get(duelId);

  if (duel) {
    duel.isFinished = true;
  }
};
