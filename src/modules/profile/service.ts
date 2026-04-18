import { bold, KarboContext } from 'karboai';

import { getCreateUser, prisma } from '../../lib/prisma';
import { getAvatarUrl, level } from '../../lib/util';
import { drawCreditCard, drawProfile } from '../../lib/canvas';
import { FLATTED_PRODUCTS, WORKS_RECORD } from '../../constants';
import { staticValues } from '../../../public/data/constants.json';
import { validateProduct } from '../../lib/snippets';

export const meCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { stats: true, couple: true },
  );

  const levelInfo = level(user.stats!.experience);

  let hasCouple;

  if (user.coupleId) {
    const couple = await prisma.couple.findFirst({
      where: { id: user.coupleId },
      include: { users: true },
    });
    const coupleUser = await karbo.user(
      couple!.users.filter((user) => user.id != message.author.userId)[0].id,
    );

    hasCouple = {
      nickname: coupleUser.nickname,
      avatar: getAvatarUrl(coupleUser.avatar),
    };
  }

  const image = await drawProfile({
    nickname: message.author.nickname,
    level: levelInfo.level,
    frame: user.currentFrame,
    experience: {
      from: user.stats!.experience,
      to: levelInfo.maxExperience,
    },
    avatar: message.author.avatarUrl,
    stats: {
      messages: user.stats!.messages,
      robs: user.stats!.robs,
      duels: user.stats!.duels,
    },
    work: user.work ? WORKS_RECORD[user.work].name : staticValues.work,
    reputation: user.stats!.reputation,
    background: user.currentBackground
      ? `background-${user.currentBackground}`
      : undefined,
    hasCouple,
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};

export const bankCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { card: true },
  );

  const image = await drawCreditCard({
    cardNumber: user.card!.number,
    initials: user.card!.initials,
    date: user.card!.date,
    balance: user.card!.balance,
    cash: user.card!.cash,
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};

export const frameCallback = async ({ karbo, message }: KarboContext) => {
  const frame = await validateProduct({ karbo, message }, 'frames');

  if (!frame) return;

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { currentFrame: frame.thumbnail.split('-')[1] },
  });

  await karbo.text(
    message.chatId,
    `Вы успешно поставили рамку - ${bold(frame.title)}`,
    message.messageId,
  );
};

export const backgroundCallback = async ({ karbo, message }: KarboContext) => {
  const background = await validateProduct({ karbo, message }, 'backgrounds');

  if (!background) return;

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { currentBackground: background.thumbnail.split('-')[1] },
  });

  await karbo.text(
    message.chatId,
    `Вы успешно поставили фон - ${bold(background.title)}`,
    message.messageId,
  );
};

export const ownedCallback = async ({ karbo, message }: KarboContext) => {
  const ownedProductIds = (
    await prisma.productsOnUsers.findMany({
      where: { userId: message.author.userId },
      select: { productId: true },
    })
  ).map(({ productId }) => productId);

  const products = FLATTED_PRODUCTS.filter((product) =>
    ownedProductIds.includes(product.id),
  );

  await karbo.text(
    message.chatId,
    `Ваши купленные товары: ${products.map((product) => bold(product.title)).join(', ') || bold('отсутствуют')}`,
    message.messageId,
  );
};
