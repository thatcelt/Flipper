import { bold, code, KarboContext } from 'karboai';
import { ALL_COMMANDS } from '../../constants';

export const helpCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(
    message.chatId,
    `${bold('Навигация')}\n\n${ALL_COMMANDS}`,
    message.messageId,
  );
};

export const joinCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(
    message.chatId,
    `Привет, ${bold(message.author.nickname)}! Я игровой бот Флиппер, для просмотра списка команд напишите ${code('/help')}`,
    message.messageId,
  );
};
