import type { KarboAI, Message } from 'karboai';

import type { InteractionCallbackQuery } from 'karboai/dist/dto/dispatcher.dto';
import type { Couple, Prisma } from '../../generated/prisma/client';

type MoneyType = 'cash' | 'balance';
type CosmeticsType = 'profile' | 'couple' | 'clan';

type ErrorKey =
  | 'wrongType'
  | 'notEnoughMoney'
  | 'wrongUser'
  | 'betAmount'
  | 'notEnoughReputation'
  | 'unemployed'
  | 'workNotFound'
  | 'alreadyWorking'
  | 'unemployed'
  | 'getFired'
  | 'wrongPage'
  | 'alreadyBought'
  | 'productNotFound'
  | 'invalidProductType'
  | 'productNotOwned'
  | 'alreadyInDuel'
  | 'alreadyRequested'
  | 'userAlreadyInDuel'
  | 'forbidden'
  | 'alreadyMarried'
  | 'marryAlreadyRequested'
  | 'notMarried'
  | 'wrongCategory';

export type Product = {
  id: number;
  thumbnail: string;
  title: string;
  cost: number;
};

export type DisplayErrorBuilder = {
  karbo: KarboAI;
  chatId: string;
  messageId?: string;
  key: ErrorKey;
};

export type IsScheduledBuilder = {
  karbo: KarboAI;
  dataSource: Message | InteractionCallbackQuery;
  scheduledTime: bigint;
  other?: boolean;
};

export type HasEnoughMoneyBuilder = {
  karbo: KarboAI;
  dataSource: Message;
  type: MoneyType;
};

export type ValidateUserBuilder = {
  karbo: KarboAI;
  message: Message;
  userId?: string;
};

export type UpdateWorkBuilder = {
  karbo: KarboAI;
  message: Message;
  user: Prisma.UserGetPayload<{ include: { stats: true } }>;
  rawWorkId: string;
};

export type FindCosmeticsBuilder = {
  karbo: KarboAI;
  message: Message;
  type: CosmeticsType;
};

export type FindProductBuilder = {
  karbo: KarboAI;
  message: Message;
  type: CosmeticsType;
  products: Product[];
};

export type DuelTurnBuilder = {
  karbo: KarboAI;
  chatId: string;
  duelId: string;
};

export type CheckStreakBuilder = {
  karbo: KarboAI;
  message: Message;
  couple: Couple;
};
