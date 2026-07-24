import { code, type MessageCallback } from 'karboai';

import prisma, { getUser } from '../../util/prisma';
import { perks, profile } from '../../util/canvas';
import { DEFAULT_WORK, FLATTED_PRODUCTS, PERK_TEXTS, WORKS_RECORD } from '../../constants';
import { calculateLevel } from '../../util/helpers';
import { changeBackground, changeFrame, findCardColor } from '../../util/snippets';
import { buildPerks } from '../../util/buttons';
import type { BackgroundKey, FrameKey } from '../../types/canvas';
import type { InteractionCallback, InteractionMiddleware } from 'karboai/dist/types/dispatcher';
import type { Perk } from '../../../generated/prisma/enums';
import { message } from '../common/service';

export const perksMiddleware: InteractionMiddleware = async ({
  query,
}): Promise<boolean | undefined> => {
  if (query.buttonId.includes(query.userId)) return true;
};

export const me: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const user = await getUser({
    user: message.author,
    include: { stats: true, couple: true, clan: true },
  });
  const { level, maxExperience } = calculateLevel(user.stats!.experience);

  let couple = undefined;

  if (user.couple) {
    const { id } = (await prisma.user.findFirst({
      where: { coupleId: user.couple.id, id: { not: message.author.userId } },
      select: { id: true },
    }))!;
    const { nickname, avatar } = await karbo.user(id);

    couple = { nickname, avatar };
  }

  let clan = undefined;

  if (user.clan) clan = { name: user.clan.title, avatar: user.clan.icon };

  const media = await karbo.upload(
    await profile({
      nickname: message.author.nickname,
      work: !user.work ? DEFAULT_WORK : WORKS_RECORD[user.work]!.name,
      frame: user.frame as FrameKey,
      background: `backgrounds-${user.background}` as BackgroundKey,
      level,
      experience: {
        from: user.stats!.experience,
        to: maxExperience,
      },
      perk: user.stats!.perk as Perk | undefined,
      reputation: user.stats!.reputation,
      avatar: message.author.avatarUrl,
      stats: user.stats!,
      couple,
      clan,
    })
  );

  await karbo.image({
    chatId: message.chatId,
    images: [media],
    replyMessageId: message.messageId,
  });
};

export const items: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const user = await getUser({ user: message.author, include: { products: true } });

  const items = user.products.map((product, index) => {
    return `${index + 1}. ${FLATTED_PRODUCTS[product.productId]?.title} [ID: ${product.productId}]`;
  });

  await karbo.text({
    chatId: message.chatId,
    content: `Купленные товары:\n\n${items.join('\n')}`,
    replyMessageId: message.messageId,
  });
};

export const setFrame: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const frame = await changeFrame({ karbo, message, type: 'profile' });

  if (!frame) return;

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { frame },
  });
};

export const setBackground: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const background = await changeBackground({ karbo, message, type: 'profile' });

  if (!background) return;

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { background },
  });
};

export const setCardColor: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const cardFrame = await findCardColor({ karbo, message, type: 'profile' });

  if (!cardFrame) return;

  const [, color] = cardFrame.thumbnail.split('-');

  await prisma.card.update({
    where: { ownerId: message.author.userId },
    data: { color },
  });

  await karbo.text({
    chatId: message.chatId,
    content: `Вы поставили цвет карты - ${code(cardFrame.title)}`,
  });
};

export const perk: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const user = await getUser({ user: message.author, include: { stats: true } });

  const { level } = calculateLevel(user.stats!.experience);

  if (level < 40) {
    await karbo.text({
      chatId: message.chatId,
      replyMessageId: message.messageId,
      content: `У вас слишком маленький уровень`,
    });
    return;
  }

  await karbo.image({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    images: [await karbo.upload(await perks())],
    caption: user.stats!.perk ? `Ваш перк - ${PERK_TEXTS[user.stats!.perk]}` : 'Выберите ваш перк',
    inlineButtons: user.stats!.perk ? undefined : buildPerks(message.author.userId),
  });
};

export const setPerk: InteractionCallback = async ({ karbo, query }): Promise<void> => {
  const [, perk, userId] = query.buttonId.split('_');

  if (await prisma.user.findFirst({ where: { id: userId, stats: { perk: { not: null } } } }))
    return;

  await prisma.user.update({
    where: { id: userId },
    data: { stats: { update: { perk: perk as Perk } } },
  });

  await karbo.text({ chatId: query.chatId, content: `Вы выбрали свой перк` });
};
