import { bold, KarboContext, User } from 'karboai';

import { ErrorsMap, Product, ProductCategory } from '../schemas/interactive';
import { findUuid, getRelative } from './util';
import { prisma } from './prisma';
import { CardColumn } from '../schemas/prisma';
import { errorsMap } from '../../public/data/constants.json';
import { FLATTED_SHOPS } from '../constants';

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

export const validateUser = async (
  context: KarboContext,
): Promise<User | undefined> => {
  const uuid = findUuid(context.message.content);

  if (
    !uuid ||
    uuid[0] == context.message.author.userId ||
    uuid[0] == process.env.BOT_ID
  ) {
    await outputException(context, 'enterCorrectUser');
    return;
  }

  try {
    return await context.karbo.user(uuid[0]);
  } catch {
    await outputException(context, 'userNotFound');
    return;
  }
};

export const validateProduct = async (
  context: KarboContext,
  category: ProductCategory,
): Promise<Product | undefined> => {
  const productId = Number(context.message.content.split(' ')[1]);

  if (isNaN(productId)) {
    await outputException(context, 'enterCorrectProductId');
    return;
  }

  const product = FLATTED_SHOPS[category].find(
    (product) => product.id == productId,
  );

  if (!product) {
    await outputException(context, 'productNotFound');
    return;
  }

  if (
    !(await prisma.productsOnUsers.findFirst({
      where: { userId: context.message.author.userId, productId },
    }))
  ) {
    await outputException(context, 'productNotOwned');
    return;
  }

  return product;
};

export const manageStreakEnd = async (
  context: KarboContext,
  actionStreak: number,
  coupleId: number,
) => {
  await context.karbo.text(
    context.message.chatId,
    `Вы пропустили серию дней из поцелуев, остановившись на ${bold(actionStreak.toString())}!\n${bold('Теперь ваш прогресс сброшен до 0 дней...')}`,
    context.message.messageId,
  );

  const timestamp = Date.now();

  await prisma.couple.update({
    data: { lastStreakAt: timestamp },
    where: { id: coupleId },
  });

  return timestamp;
};
