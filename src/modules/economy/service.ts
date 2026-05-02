import { bold, code, KarboContext } from 'karboai';

import {
  FLATTED_PRODUCTS,
  FLIP_CASES,
  WORKS_RECORD,
  WORKS_STRING,
} from '../../constants';
import { getCreateUser, prisma } from '../../lib/prisma';
import {
  outputException,
  outputRelativeTime,
  validateCardValue,
  validateUser,
} from '../../lib/snippets';
import {
  generateCasinoVariants,
  generateDaily,
  getChangingExpression,
  getCasinoType,
  numberWithTax,
  isFlipWon,
} from '../../lib/util';
import { UserWithStats } from '../../schemas/prisma';
import {
  delays,
  staticValues,
  shopCategories,
} from '../../../public/data/constants.json';
import * as shopsData from '../../../public/data/shops.json';
import { drawCasino, drawShop } from '../../lib/canvas';
import { ShopElement, ShopMap } from '../../schemas/canvas';

const setWork = async (
  context: KarboContext,
  user: UserWithStats,
  workId: string,
) => {
  const work = WORKS_RECORD[workId];

  if (!work) {
    await outputException(
      { karbo: context.karbo, message: context.message },
      'workNotFound',
    );
    return;
  }

  if (user.work == workId) {
    await outputException(
      { karbo: context.karbo, message: context.message },
      'alreadyWorking',
    );
    return;
  }

  if (user.stats!.reputation < work.minReputation) {
    await outputException(
      { karbo: context.karbo, message: context.message },
      'notEnoughReputation',
    );
    return;
  }

  await prisma.user.update({
    data: { work: workId },
    where: { id: context.message.author.userId },
  });
  await context.karbo.text(
    context.message.chatId,
    `Вы успешно устроились на работу - ${bold(work.name)}`,
    context.message.messageId,
  );
};

export const worksListCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(message.chatId, WORKS_STRING, message.messageId);
};

export const workCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');

  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true, stats: true },
  );

  if (splittedContent[1]) {
    await setWork({ karbo, message }, user, splittedContent[1]);
    return;
  }

  const work = WORKS_RECORD[user.work!];

  if (!work) {
    await outputException({ karbo, message }, 'noWork');
    return;
  }

  if (work.minReputation > user.stats!.reputation) {
    await outputException({ karbo, message }, 'getFired');
    await prisma.user.update({
      where: {
        id: message.author.userId,
      },
      data: {
        work: null,
      },
    });
    return;
  }

  const timestamp = Date.now();

  if (timestamp < user.schedule!.canWorkAt) {
    await outputRelativeTime(
      { karbo, message },
      Number(user.schedule!.canWorkAt) - timestamp,
    );
    return;
  }

  await prisma.user.update({
    where: {
      id: message.author.userId,
    },
    data: {
      stats: { update: { experience: { increment: 50 } } },
      card: { update: { cash: { increment: work.salary } } },
      schedule: {
        update: { canWorkAt: timestamp + delays.work },
      },
    },
  });

  await karbo.text(
    message.chatId,
    `Вы отработали и получили ${bold(work.salary.toString())} гемов за рабочий день!`,
    message.messageId,
  );
};

export const dailyCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true },
  );
  const timestamp = Date.now();

  if (timestamp < user.schedule!.canDailyAt) {
    await outputRelativeTime(
      { karbo, message },
      Number(user.schedule!.canDailyAt) - timestamp,
    );
    return;
  }

  const reward = generateDaily();

  await prisma.user.update({
    where: {
      id: message.author.userId,
    },
    data: {
      stats: { update: { experience: { increment: 50 } } },
      card: {
        update: { cash: { increment: reward } },
      },
      schedule: { update: { canDailyAt: timestamp + delays.daily } },
    },
  });

  await karbo.text(
    message.chatId,
    `За ежедневную награду вы заработали ${reward} гемов`,
    message.messageId,
  );
};

export const betCallback = async ({ karbo, message }: KarboContext) => {
  const splitted = message.content.split(' ');
  const bet = await validateCardValue({ karbo, message }, splitted[1]);
  if (!bet) return;

  if (bet < staticValues.minDeposit) {
    await outputException({ karbo, message }, 'minDeposit');
    return;
  }

  const type = getCasinoType();
  const variants = generateCasinoVariants(type == 'casino-win');

  const image = await drawCasino({
    type,
    variants,
    value: type == 'casino-win' ? bet * 2 : bet,
  });

  await prisma.user.update({
    where: { id: message.author.userId },
    data: {
      stats: { update: { experience: { increment: 50 } } },
      card: {
        update: {
          balance: getChangingExpression(
            type == 'casino-win' ? 'won' : 'lose',
            bet,
          ),
        },
      },
    },
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};

export const transferCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');
  const transferSummary = await validateCardValue(
    { karbo, message },
    splittedContent[1],
    'cash',
  );

  if (!transferSummary) return;

  await prisma.user.update({
    where: { id: message.author.userId },
    data: {
      card: {
        update: {
          cash: { decrement: transferSummary },
          balance: { increment: transferSummary },
        },
      },
    },
  });

  await karbo.text(
    message.chatId,
    `Вы перевели ${transferSummary} гемов`,
    message.messageId,
  );
};

export const tradeCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');

  const tradeSummary = await validateCardValue(
    { karbo, message },
    splittedContent[1],
  );

  if (!tradeSummary) return;

  const user = await validateUser({ karbo, message });

  if (!user) return;

  const taxedSummary = numberWithTax(tradeSummary);
  await getCreateUser(user.userId, user.nickname);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: message.author.userId },
      data: { card: { update: { balance: { decrement: tradeSummary } } } },
    }),
    prisma.user.update({
      where: { id: user.userId },
      data: { card: { update: { balance: { increment: taxedSummary } } } },
    }),
  ]);

  await karbo.text(
    message.chatId,
    `Вы перевели ${taxedSummary} гемов для ${bold(user.nickname)} с учётом комиссии`,
    message.messageId,
  );
};

export const flipCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');

  const bet = await validateCardValue({ karbo, message }, splittedContent[1]);

  if (!bet) return;

  const timestamp = Date.now();

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: message.author.userId },
    include: { schedule: true },
  });

  if (user.schedule!.canCoinAt > timestamp) {
    await outputRelativeTime(
      { karbo, message },
      Number(user.schedule!.canCoinAt) - timestamp,
    );
    return;
  }

  const type = isFlipWon();
  const increatedBet = Math.floor(Number(bet * 1.5));
  const text = FLIP_CASES[String(type)];

  await prisma.user.update({
    where: { id: message.author.userId },
    data: {
      stats: { update: { experience: { increment: 50 } } },
      schedule: { update: { canCoinAt: timestamp + delays.coin } },
      card: {
        update: {
          balance: getChangingExpression(type ? 'won' : 'lose', increatedBet),
        },
      },
    },
  });

  await karbo.text(
    message.chatId,
    `${text} ${code(increatedBet.toString())} гемов`,
    message.messageId,
  );
};

export const shopCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');
  const category = splittedContent[1];
  const page = isNaN(Number(splittedContent[2]))
    ? 1
    : Number(splittedContent[2]);

  if (!shopCategories.includes(category)) {
    await outputException({ karbo, message }, 'unknownCategory');
    return;
  }

  const shop = shopsData[category as keyof typeof shopsData];
  const elements = shop[page - 1] as ShopElement[];

  if (!elements) {
    await outputException({ karbo, message }, 'unknownPage');
    return;
  }

  const image = await drawShop({
    type: category as ShopMap,
    elements,
    previousPage: page - 1 == 0 ? '' : (page - 1).toString(),
    nextPage: page == shop.length ? '' : (page + 1).toString(),
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};

export const buyCallback = async ({ karbo, message }: KarboContext) => {
  const splittedMessage = message.content.split(' ');
  const productId = Number(splittedMessage[1]);

  const product = FLATTED_PRODUCTS.find((product) => product.id === productId);

  if (!product) {
    await outputException({ karbo, message }, 'productNotFound');
    return;
  }

  if (
    await prisma.productsOnUsers.findFirst({
      where: { userId: message.author.userId, productId },
    })
  ) {
    await outputException({ karbo, message }, 'productAlreadyOwned');
    return;
  }

  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { card: true },
  );

  if (user.card!.balance < product.cost) {
    await outputException({ karbo, message }, 'notEnoughMoney');
    return;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: message.author.userId },
      data: { card: { update: { balance: { decrement: product.cost } } } },
    }),
    prisma.productsOnUsers.create({
      data: { userId: message.author.userId, productId },
    }),
  ]);

  await karbo.text(
    message.chatId,
    `Вы успешно приобрели товар - ${bold(product.title)}`,
  );
};
