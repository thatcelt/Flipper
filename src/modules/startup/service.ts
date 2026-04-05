import { bold, code, KarboContext } from 'karboai';
import { ALL_COMMANDS } from '../../constants';
import { createUser, prisma } from '../../lib/prisma';
import { delay } from '../../lib/util';

const updateStats = async (userId: string) => {
  await prisma.stats.update({
    where: { userId },
    data: { messages: { increment: 1 }, experience: { increment: 1 } },
  });
};

export const helpCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(
    message.chatId,
    `${bold('Навигация')}\n\n${ALL_COMMANDS}`,
    message.messageId,
  );
};

export const joinCallback = async ({ karbo, message }: KarboContext) => {
  try {
    await karbo.text(
      message.chatId,
      `Привет, ${bold(message.author.nickname)}! Я игровой бот Флиппер, для просмотра списка команд напишите ${code('/help')}`,
      message.messageId,
    );
  } catch {}
};

export const onMessageCallback = async ({ message }: KarboContext) => {
  try {
    await updateStats(message.author.userId);
  } catch {
    await delay(3);
    await createUser(message.author.userId, message.author.nickname);
    await updateStats(message.author.userId);
  }
};
