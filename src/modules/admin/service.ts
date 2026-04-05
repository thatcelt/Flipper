import { KarboContext } from 'karboai';

export const pingCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(message.chatId, 'pong', message.messageId);
};
