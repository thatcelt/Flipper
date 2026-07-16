import type { MessageCallback } from 'karboai';

import { getUser } from '../../util/prisma';
import { BOT_PREFIX } from '../../constants';

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
  await karbo.text({
    chatId: message.chatId,
    content: `Сейчас бот находится на техобслуживании.\n\nДевлог и новости будут проводиться в чате поддержки - ${process.env.CHAT_URL}`,
    replyMessageId: message.messageId,
  });
};
