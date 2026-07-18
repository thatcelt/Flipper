import { bold, code, type MessageCallback } from 'karboai';

import prisma, { getUser, incrementCash } from '../../util/prisma';
import { card, casino, market } from '../../util/canvas';
import shopCategories from '../../../public/data/shop.json';
import {
  displayError,
  getUserIfEnoughMoney,
  isScheduled,
  updateWork,
  validateUser,
} from '../../util/snippets';
import { isCasinoWon, casinoVariants, dailyReward } from '../../util/helpers';
import {
  COOLDOWNS,
  FLATTED_PRODUCTS,
  SHOP_CATEGORIES,
  WORKS_RECORD,
  WORKS_STRING,
} from '../../constants';
import type { BackgroundKey, CardColor, ShopEntity, ShopKey } from '../../types/canvas';

export const bank: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const user = await getUser({ user: message.author, include: { card: true } });

  const media = await karbo.upload(
    card({
      balance: user.card!.balance,
      cash: user.card!.cash,
      color: `cards-${user.card!.color}` as CardColor,
      date: user.card!.date,
      initials: user.card!.initials,
      number: user.card!.number,
      background: `backgrounds-${user.background}` as BackgroundKey,
    })
  );

  await karbo.image({ chatId: message.chatId, images: [media], replyMessageId: message.messageId });
};

export const daily: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const user = await getUser({ user: message.author, include: { schedule: true } });

  if (await isScheduled({ karbo, dataSource: message, scheduledTime: user.schedule!.canDailyAt }))
    return;

  const increment = dailyReward();

  await incrementCash({
    id: message.author.userId,
    increment,
    schedule: { update: { canDailyAt: Date.now() + COOLDOWNS.daily } },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Успех! За ежедневную награду вы получили ${code(increment.toString())} фликов`,
  });
};

export const transfer: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const transferData = await getUserIfEnoughMoney({ karbo, dataSource: message, type: 'cash' });

  if (!transferData) return;

  const { amount } = transferData;

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { card: { update: { cash: { decrement: amount }, balance: { increment: amount } } } },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Вы перевели ${code(amount.toString())} фликов на свой баланс`,
  });
};

export const trade: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const transferData = await getUserIfEnoughMoney({ karbo, dataSource: message, type: 'balance' });

  if (!transferData) return;

  const { amount } = transferData;
  const target = await validateUser({ karbo, message });

  if (!target) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: message.author.userId },
      data: { card: { update: { balance: { decrement: amount } } } },
    }),
    prisma.user.update({
      where: { id: target.userId },
      data: { card: { update: { balance: { increment: amount } } } },
    }),
  ]);

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Вы перевели ${code(amount.toString())} фликов на баланс ${bold(target.nickname)}`,
  });
};

export const bet: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const betData = await getUserIfEnoughMoney({ karbo, dataSource: message, type: 'balance' });

  if (!betData) return;

  const { amount } = betData;

  if (amount < 100 || amount > 3000) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'betAmount',
      chatId: message.chatId,
    });
    return;
  }

  const key = isCasinoWon();

  const media = await karbo.upload(
    await casino({ key, variants: casinoVariants(key), value: amount })
  );

  await prisma.user.update({
    where: { id: message.author.userId },
    data: {
      card: {
        update: {
          balance: key == 'casino-casino-win' ? { increment: amount } : { decrement: amount },
        },
      },
    },
  });

  await karbo.image({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    images: [media],
  });
};

export const jobs: MessageCallback = async ({ karbo, message }): Promise<void> => {
  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: WORKS_STRING,
  });
};

export const work: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const [, workId] = message.content.split(' ');
  const user = await getUser({ user: message.author, include: { stats: true, schedule: true } });

  if (workId) {
    await updateWork({ karbo, message, user, rawWorkId: workId });
    return;
  }

  if (!user.work) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'unemployed',
      chatId: message.chatId,
    });
    return;
  }

  const work = WORKS_RECORD[user.work]!;

  if (work?.minReputation > user.stats!.reputation) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'getFired',
      chatId: message.chatId,
    });
    await prisma.user.update({ where: { id: message.author.userId }, data: { work: null } });
    return;
  }

  if (await isScheduled({ karbo, dataSource: message, scheduledTime: user.schedule!.canWorkAt }))
    return;

  await incrementCash({
    id: message.author.userId,
    increment: work.salary,
    schedule: { update: { canWorkAt: Date.now() + COOLDOWNS.work } },
  });

  await karbo.text({
    chatId: message.chatId,
    content: `Вы отработали свой рабочий день и получили ${code(work.salary.toString())} фликов за день!`,
    replyMessageId: message.messageId,
  });
};

export const shop: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const [, category, rawPage] = message.content.split(' ');
  const page = Number(rawPage);

  if (!category || isNaN(page) || !SHOP_CATEGORIES.includes(category)) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'wrongCategory',
      chatId: message.chatId,
    });
    return;
  }

  const categoryPages = shopCategories[category as keyof typeof shopCategories] as number[];
  const elements = categoryPages[page - 1] as ShopEntity[] | undefined;

  if (!elements) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'wrongPage',
      chatId: message.chatId,
    });
    return;
  }

  const media = await karbo.upload(
    await market({
      key: `shop-shop-${category}` as ShopKey,
      elements,
      previous: page - 1 == 0 ? '' : (page - 1).toString(),
      next: page == categoryPages.length ? '' : (page + 1).toString(),
    })
  );

  await karbo.image({
    chatId: message.chatId,
    caption: `Количество страниц: ${code(categoryPages.length.toString())}`,
    replyMessageId: message.messageId,
    images: [media],
  });
};

export const buy: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const [, productId] = message.content.split(' ');

  const product = FLATTED_PRODUCTS[Number(productId)];

  if (!product) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'wrongType',
      chatId: message.chatId,
    });
    return;
  }

  const user = await getUser({ user: message.author, include: { products: true, card: true } });

  if (user.products.find((p) => p.productId == product.id)) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'alreadyBought',
      chatId: message.chatId,
    });
    return;
  }

  if (product.cost > user.card!.balance) {
    await displayError({
      karbo,
      messageId: message.messageId,
      key: 'notEnoughMoney',
      chatId: message.chatId,
    });
    return;
  }

  await prisma.user.update({
    where: { id: message.author.userId },
    data: {
      card: { update: { balance: { decrement: product.cost } } },
      products: { create: { productId: product.id } },
    },
  });

  await karbo.text({
    chatId: message.chatId,
    content: `Вы купили ${bold(product.title)} за ${code(product.cost.toString())} фликов`,
    replyMessageId: message.messageId,
  });
};
