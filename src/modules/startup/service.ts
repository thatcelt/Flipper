import { bold, code, KarboContext } from 'karboai';

import { ALL_COMMANDS, SUB_COMMANDS } from '../../constants';
import { getCreateUser, prisma } from '../../lib/prisma';
import { SubCommandsEnum } from '../../schemas/interactive';
import { outputException } from '../../lib/snippets';
import { leaveEventCallbacks } from '../../../public/data/constants.json';
import { delay } from '../../lib/util';

export const helpCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');
  const baseText = `${bold('Навигация')}\n\n`;

  let commandsCategory: string | undefined;

  try {
    if (splittedContent[1]) {
      commandsCategory =
        SUB_COMMANDS[SubCommandsEnum.parse(splittedContent[1])];
    }
  } catch {
    await outputException({ karbo, message }, 'unknownCategory');
    return;
  }

  await karbo.text(
    message.chatId,
    `${baseText}${commandsCategory || ALL_COMMANDS}`,
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
  if (message.content.startsWith('/')) return;

  try {
    await prisma.stats.update({
      where: { userId: message.author.userId },
      data: { messages: { increment: 1 }, experience: { increment: 1 } },
    });
  } catch {
    await delay(3.5);
    await getCreateUser(message.author.userId, message.author.nickname);
  }
};

export const leaveCallback = async ({ karbo, message }: KarboContext) => {
  try {
    await karbo.text(
      message.chatId,
      leaveEventCallbacks[
        Math.floor(Math.random() * leaveEventCallbacks.length)
      ].replace('%s', message.author.nickname),
      message.messageId,
    );
  } catch {}
};

export const bigBroCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.image(
    message.chatId,
    [process.env.BIG_BRO_URL],
    message.messageId,
  );
};
