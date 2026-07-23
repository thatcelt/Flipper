import { code, type MessageCallback } from 'karboai';
import type { MessageMiddleware } from 'karboai/dist/types/dispatcher';
import prisma from '../../util/prisma';
import { isScheduled, validateUser } from '../../util/snippets';
import { geHackAndtSacrifice, getCrimeAndRescue } from '../../util/helpers';

export const villainMiddleware: MessageMiddleware = async ({
  message,
}): Promise<boolean | undefined> => {
  if (
    await prisma.user.findFirst({
      where: { id: message.author.userId, stats: { reputation: { lte: 100 } } },
    })
  )
    return true;
};

export const hack: MessageCallback = async ({ karbo, message }) => {
  const target = await validateUser({ karbo, message });

  if (!target) return;

  const schedule = await prisma.schedule.findFirst({ where: { userId: message.author.userId } });

  if (await isScheduled({ karbo, source: message, scheduledTime: schedule!.canHackAt })) return;

  const reward = geHackAndtSacrifice();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: message.author.userId },
      data: { card: { update: { balance: { increment: reward } } } },
    }),
    prisma.user.update({
      where: { id: target.userId },
      data: { card: { update: { balance: { decrement: reward } } } },
    }),
  ]);

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `${message.author.nickname} воспользовался(лась) своими навыками и взломал(а) банковский счёт ${target.nickname}, украв ${code(reward.toString())} фликов!`,
  });
};

export const crime: MessageCallback = async ({ karbo, message }) => {
  const schedule = await prisma.schedule.findFirst({ where: { userId: message.author.userId } });

  if (await isScheduled({ karbo, source: message, scheduledTime: schedule!.canRescueAt })) return;

  const decrement = getCrimeAndRescue();

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { stats: { update: { reputation: { decrement } } } },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `${message.author.nickname} решил(а) ограбить банк с особой злобой! Ограбление прошло успешно, но для пущего зла все флики были сожжены дотла!\n-${code(decrement.toString())} репутации`,
  });
};

export const kick: MessageCallback = async ({ karbo, message }) => {
  const target = await validateUser({ karbo, message });

  if (!target) return;

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `${message.author.nickname} напнул(а) ${target.nickname}`,
  });
};
