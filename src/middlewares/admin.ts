import { KarboContext } from 'karboai';

export const adminMiddleware = async ({ message }: KarboContext) =>
  message.author.userId == process.env.DEVELOPER_ID;
