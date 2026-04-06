import { bold, code, KarboContext } from 'karboai';
import { ALL_COMMANDS } from '../../constants';
import { prisma } from '../../lib/prisma';

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
    await prisma.stats.update({
      where: { userId: message.author.userId },
      data: { messages: { increment: 1 }, experience: { increment: 1 } },
    });
  } catch {}
};
