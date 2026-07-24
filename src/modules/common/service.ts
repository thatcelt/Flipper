import { bold, type MessageCallback } from 'karboai';

import { getUser } from '../../util/prisma';
import { ALL_COMMANDS, BOT_PREFIX, SUB_COMMANDS } from '../../constants';
import { displayError } from '../../util/snippets';
import type { SubCommandUnion } from '../../types/constants';

export const onJoin: MessageCallback = async ({ karbo, message }) => {
  await karbo.text({
    chatId: message.chatId,
    content: 'Привет! Я - игровой бот Флиппер. Для просмотра доступных команд напиши /help',
    replyMessageId: message.messageId,
  });
};

export const message: MessageCallback = async ({ message }) => {
  if (message.content.startsWith(BOT_PREFIX) || message.author.isApiBot) return;

  try {
    await getUser({ user: message.author, update: true });
  } catch {}
};

export const help: MessageCallback = async ({ karbo, message }) => {
  const [, category] = message.content.split(' ');
  let commandsCategory: string | undefined;

  try {
    if (category) {
      commandsCategory = SUB_COMMANDS[category as SubCommandUnion];
    }
  } catch {
    await displayError({ karbo, source: message, key: 'wrongCategory' });
    return;
  }

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `${bold('Навигация')}\n\n${commandsCategory || ALL_COMMANDS}\n${bold('Чат поддержки бота -')} ${process.env.CHAT_URL}`,
  });
};
