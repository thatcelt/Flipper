import type { InlineButton } from 'karboai';

import { colors } from '../../public/data/canvas-maps.json';

export const buildDuel = (targetId: string): InlineButton[][] => [
  [
    {
      id: `accept_${targetId}`,
      label: `Драться`,
      color: { textHex: colors.white, hex: colors.green },
    },
    {
      id: `escape_${targetId}`,
      label: `Сбежать`,
      color: { textHex: colors.white, hex: colors.red },
    },
  ],
];

export const buildDuelTurn = (duelId: string): InlineButton[][] => [
  [
    {
      id: `punch_${duelId}`,
      label: `Удар`,
      color: { textHex: colors.white, hex: colors.red },
    },
    {
      id: `dodge_${duelId}`,
      label: `Уворот`,
      color: { textHex: colors.white, hex: colors.orange },
    },
  ],
  [
    {
      id: `buff-ice_${duelId}`,
      label: `Бафф льда`,
      color: { textHex: colors.white, hex: colors.blue },
    },
    {
      id: `deck_${duelId}`,
      label: `Отправка скрипта`,
      color: { textHex: colors.white, hex: colors.purple },
    },
  ],
];

export const buildMarry = (userId: string): InlineButton[][] => [
  [
    {
      id: `marry-yes_${userId}`,
      label: `Да, конечно!`,
      color: { textHex: colors.white, hex: colors.red },
    },
    {
      id: `marry-no_${userId}`,
      label: `Отказано`,
      color: { textHex: colors.white, hex: colors.black },
    },
  ],
];

export const buildInvite = (userId: string): InlineButton[][] => [
  [
    {
      id: `accept-invite_${userId}`,
      label: `Принять`,
      color: { textHex: colors.white, hex: colors.green },
    },
    {
      id: `decline-invite_${userId}`,
      label: `Отказаться`,
      color: { textHex: colors.white, hex: colors.red },
    },
  ],
];
