import type { KarboAI, Message } from 'karboai';
import type { InteractionCallbackQuery } from 'karboai/dist/dto/dispatcher.dto';
import type { Prisma } from '../../generated/prisma/client';

type MoneyType = 'cash' | 'balance';

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
  | 'wrongPage';

export type DisplayErrorBuilder = {
  karbo: KarboAI;
  chatId: string;
  messageId: string;
  key: ErrorKey;
};

export type IsScheduledBuilder = {
  karbo: KarboAI;
  dataSource: Message | InteractionCallbackQuery;
  scheduledTime: bigint;
};

export type HasEnoughMoneyBuilder = {
  karbo: KarboAI;
  dataSource: Message;
  type: MoneyType;
};

export type ValidateUserBuilder = {
  karbo: KarboAI;
  message: Message;
};

export type UpdateWorkBuilder = {
  karbo: KarboAI;
  message: Message;
  user: Prisma.UserGetPayload<{ include: { stats: true } }>;
  rawWorkId: string;
};
