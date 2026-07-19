import { type InteractionCallback, type MessageCallback } from 'karboai';
import type { InteractionMiddleware, MessageMiddleware } from 'karboai/dist/types/dispatcher';

import prisma from '../../util/prisma';
import { coupleKiss } from '../../../public/data/prisma.json';
import { marryId } from '../../../public/data/shop.json';
import {
  changeBackground,
  changeFrame,
  checkStreak,
  displayError,
  isScheduled,
  validateUser,
} from '../../util/snippets';
import { buildMarry } from '../../util/buttons';
import { couple as _couple } from '../../util/canvas';
import { COOLDOWNS } from '../../constants';
import { calculateLevel, getRelativeTime } from '../../util/helpers';
import type { BackgroundKey, FrameKey } from '../../types/canvas';

const marriageCache = new Map<string, string>();

export const coupleMiddleware: MessageMiddleware = async ({
  karbo,
  message,
}): Promise<boolean | undefined> => {
  if (
    await prisma.user.findFirst({ where: { id: message.author.userId, coupleId: { not: null } } })
  )
    return true;

  await displayError({
    karbo,
    key: 'notMarried',
    source: message,
  });
};

export const offerMiddleware: InteractionMiddleware = async ({
  query,
}): Promise<boolean | undefined> => {
  if (marriageCache.get(query.userId)) return true;
};

export const marry: MessageCallback = async ({ karbo, message }): Promise<void> => {
  if (
    !(await prisma.productsOnUser.findFirst({
      where: { userId: message.author.userId, productId: marryId },
    }))
  ) {
    await displayError({ karbo, source: message, key: 'forbidden' });
    return;
  }

  const target = await validateUser({ karbo, message });

  if (!target) return;

  if (marriageCache.get(target.userId)) {
    await displayError({ karbo, source: message, key: 'marryAlreadyRequested' });
    return;
  }

  if (
    (await prisma.user.findFirst({
      where: { id: message.author.userId, coupleId: { not: null } },
    })) ||
    (await prisma.user.findFirst({ where: { id: target.userId, coupleId: { not: null } } }))
  ) {
    await displayError({ karbo, source: message, key: 'alreadyMarried' });
    return;
  }

  marriageCache.set(target.userId, message.author.userId);

  await karbo.text({
    chatId: message.chatId,
    content: `Минута внимания! ${message.author.nickname} предложил(а) устроить свадьбу ${target.nickname}!\n${target.nickname}, согласишься ли ты на это трогательное предложение?`,
    inlineButtons: buildMarry(target.userId),
  });
};

export const love: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const user = (await prisma.user.findUnique({
    where: { id: message.author.userId },
    include: { couple: true },
  }))!;

  const couple = ((await checkStreak({ message, karbo, couple: user.couple! })) ?? user.couple)!;

  const coupleUsers = await prisma.user.findMany({ where: { coupleId: user?.coupleId } });

  const users = await Promise.all(
    coupleUsers.map(async (user) => {
      const { avatar, nickname } = await karbo.user(user.id, message.communityId);

      return { avatar, nickname };
    })
  );

  const { level, maxExperience } = calculateLevel(couple.experience);

  const media = await karbo.upload(
    await _couple({
      users,
      kisses: couple.kissesAmount,
      streak: couple.kissStreak,
      background: `backgrounds-${couple.background}` as BackgroundKey,
      createdAt: getRelativeTime(Number(couple.createdAt)).split(' ').slice(0, 2).join(' '),
      frame: couple.frame as FrameKey,
      experience: { from: couple.experience, to: maxExperience },
      level: level,
    })
  );

  await karbo.image({ images: [media], chatId: message.chatId, replyMessageId: message.messageId });
};

export const kiss: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const { couple } = (await prisma.user.findUnique({
    where: { id: message.author.userId },
    include: { couple: true },
  }))!;

  if (await isScheduled({ karbo, source: message, scheduledTime: couple!.canKissAt })) return;

  await checkStreak({ message, karbo, couple: couple! });

  await prisma.couple.update({
    where: { id: couple!.id },
    data: { lastKissAt: Date.now(), canKissAt: Date.now() + COOLDOWNS.kiss, ...coupleKiss },
  });

  const coupleUsers = await prisma.user.findMany({ where: { coupleId: couple!.id } });

  const nicknames = await Promise.all(
    coupleUsers.map(async (user) => {
      return (await karbo.user(user.id, message.communityId)).nickname;
    })
  );

  await karbo.text({
    content: `💕 ${nicknames[0]} и ${nicknames[1]} страстно поцеловались`,
    chatId: message.chatId,
    replyMessageId: message.messageId,
  });
};

export const loveBackground: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const { coupleId } = (await prisma.user.findUnique({
    where: { id: message.author.userId },
  }))!;

  const background = await changeBackground({ karbo, message, type: 'couple' });

  if (!background) return;

  await prisma.couple.update({
    where: { id: coupleId! },
    data: { background },
  });
};

export const loveFrame: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const { coupleId } = (await prisma.user.findUnique({
    where: { id: message.author.userId },
  }))!;

  const frame = await changeFrame({ karbo, message, type: 'couple' });

  if (!frame) return;

  await prisma.couple.update({
    where: { id: coupleId! },
    data: { frame },
  });
};

export const divorce: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const { coupleId } = (await prisma.user.findUnique({
    where: { id: message.author.userId },
  }))!;

  await prisma.couple.delete({ where: { id: coupleId! } });

  await karbo.text({
    chatId: message.chatId,
    content: `Печальные новости! ${message.author.nickname} официально расстался со своей парой..`,
  });
};

export const marryYes: InteractionCallback = async ({ karbo, query }): Promise<void> => {
  const oppositeUserId = marriageCache.get(query.userId)!;

  marriageCache.delete(query.userId);

  if (
    (await prisma.user.findFirst({
      where: { id: oppositeUserId, coupleId: { not: null } },
    })) ||
    (await prisma.user.findFirst({ where: { id: query.userId, coupleId: { not: null } } }))
  ) {
    await displayError({ karbo, source: query, key: 'alreadyMarried' });
    return;
  }

  const { id } = await prisma.couple.create({ data: { createdAt: Date.now() } });

  await prisma.$transaction([
    prisma.user.update({ where: { id: oppositeUserId }, data: { coupleId: id } }),
    prisma.user.update({ where: { id: query.userId }, data: { coupleId: id } }),
  ]);

  const [user, oppositeUser] = await Promise.all([
    karbo.user(query.userId, query.communityId),
    karbo.user(oppositeUserId, query.communityId),
  ]);

  await karbo.text({
    chatId: query.chatId,
    content: `🎉 Да! ${user.nickname} и ${oppositeUser.nickname} теперь официально муж и жена! Поздравляем молодожёнов! 🎉`,
  });
};

export const marryNo: InteractionCallback = async ({ karbo, query }): Promise<void> => {
  const user = await karbo.user(query.userId, query.communityId);

  marriageCache.delete(query.userId);

  await karbo.text({
    content: `К сожалению ${user.nickname} отказал(а) на предложение в свадьбе! :(`,
    chatId: query.chatId,
  });
};
