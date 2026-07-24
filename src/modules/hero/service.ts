import { code, type MessageCallback } from 'karboai';
import type { MessageMiddleware } from 'karboai/dist/types/dispatcher';

import prisma from '../../util/prisma';
import { isScheduled, validateUser } from '../../util/snippets';
import { geHackAndtSacrifice, getCrimeAndRescue } from '../../util/helpers';
import { COOLDOWNS } from '../../constants';

export const heroMiddleware: MessageMiddleware = async ({
  message,
}): Promise<boolean | undefined> => {
  if (
    await prisma.user.findFirst({
      where: { id: message.author.userId, stats: { reputation: { gte: 100 } } },
    })
  )
    return true;
};

export const sacrifice: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const target = await validateUser({ karbo, message });

  if (!target) return;

  const schedule = await prisma.schedule.findFirst({ where: { userId: message.author.userId } });

  if (await isScheduled({ karbo, source: message, scheduledTime: schedule!.canSacrificeAt }))
    return;

  const increment = geHackAndtSacrifice();

  await prisma.$transaction(
    [message.author.userId, target.userId].map((userId) =>
      prisma.user.update({
        where: { id: userId },
        data: {
          card: { update: { balance: { increment } } },
          schedule: { update: { canSacrificeAt: Date.now() + COOLDOWNS.sides } },
        },
      })
    )
  );

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `По-геройски ${message.author.nickname} решил(а) помочь ${target.nickname} фликами, и прохожие настолько были растроганы, что полностью возместили ему(ей) траты ДВАЖДЫ!\n+${code(increment.toString())} фликов им обоим`,
  });
};

export const rescue: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const schedule = await prisma.schedule.findFirst({ where: { userId: message.author.userId } });

  if (await isScheduled({ karbo, source: message, scheduledTime: schedule!.canRescueAt })) return;

  const increment = getCrimeAndRescue();

  await prisma.user.update({
    where: { id: message.author.userId },
    data: {
      stats: { update: { reputation: { increment } } },
      schedule: { update: { canRescueAt: Date.now() + COOLDOWNS.sides } },
    },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `По случайному стечению обстоятельств ${message.author.nickname} спасает одного из участников чата от взлома!\n+${code(increment.toString())} репутации герою!`,
  });
};

export const pat: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const target = await validateUser({ karbo, message });

  if (!target) return;

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `${message.author.nickname} погладил(а) ${target.nickname} по макушке`,
  });
};
