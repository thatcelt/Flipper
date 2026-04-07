import { bold, KarboContext } from 'karboai';

import { ErrorsMap } from '../schemas/interactive';
import { findUuid, getRelative } from './util';
import { prisma } from './prisma';
import { CardColumn } from '../schemas/prisma';
import { errorsMap } from '../../public/data/constants.json';

export const outputException = async (
  context: KarboContext,
  exception: ErrorsMap,
): Promise<void> => {
  await context.karbo.text(
    context.message.chatId,
    `Ошибка: ${errorsMap[exception as keyof typeof errorsMap]}`,
  );
};

export const outputRelativeTime = async (
  context: KarboContext,
  relativeTime: number,
): Promise<void> => {
  await context.karbo.text(
    context.message.chatId,
    `Вы сможете использовать эту команду только ${bold(getRelative(relativeTime))}`,
    context.message.messageId,
  );
};

export const validateCardValue = async (
  context: KarboContext,
  rawAmount: string,
  cardColumn: CardColumn = 'balance',
): Promise<number | undefined> => {
  const amount = Number(rawAmount);
  if (isNaN(amount) || amount <= 0) {
    await outputException(context, 'enterCorrectAmount');
    return;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: context.message.author.userId,
      card: { [cardColumn]: { gte: amount } },
    },
  });

  if (!user) {
    await outputException(context, 'notEnoughMoney');
    return;
  }

  return amount;
};

export const validateUser = async (context: KarboContext) => {
  const uuid = findUuid(context.message.content);
  console.log(uuid);

  if (
    !uuid ||
    uuid[0] == context.message.author.userId ||
    uuid[0] == process.env.BOT_ID
  ) {
    await context.karbo.text(
      context.message.chatId,
      'Введите корректного пользователя',
      context.message.messageId,
    );
    return;
  }

  return uuid[0];
};
