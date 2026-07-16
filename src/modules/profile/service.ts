import { code, type MessageCallback } from 'karboai';

import prisma, { getUser } from '../../util/prisma';
import { profile } from '../../util/canvas';
import { DEFAULT_WORK, FLATTED_PRODUCTS, WORKS_RECORD } from '../../constants';
import { calculateLevel } from '../../util/helpers';
import { findBackground, findFrame } from '../../util/snippets';
import type { BackgroundKey, FrameKey } from '../../types/canvas';

export const me: MessageCallback = async ({ karbo, message }) => {
  const user = await getUser({ user: message.author, include: { stats: true } });
  const { level, maxExperience } = calculateLevel(user.stats!.experience);

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
      reputation: user.stats!.reputation,
      avatar: message.author.avatarUrl,
      stats: user.stats!,
    })
  );

  await karbo.image({
    chatId: message.chatId,
    images: [media],
    replyMessageId: message.messageId,
  });
};

export const items: MessageCallback = async ({ karbo, message }) => {
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

export const setFrame: MessageCallback = async ({ karbo, message }) => {
  const frame = await findFrame({ karbo, message, type: 'profile' });

  if (!frame) return;

  const [, frameName, _] = frame.thumbnail.split('-');

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { frame: frameName },
  });

  await karbo.text({
    chatId: message.chatId,
    content: `Вы поставили рамку - ${code(frame.title)}`,
  });
};

export const setBackground: MessageCallback = async ({ karbo, message }) => {
  const background = await findBackground({ karbo, message, type: 'profile' });

  if (!background) return;

  const [, backgroundName] = background.thumbnail.split('-');

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { background: backgroundName },
  });

  await karbo.text({
    chatId: message.chatId,
    content: `Вы поставили фон - ${code(background.title)}`,
  });
};
