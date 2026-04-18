import { bold, KarboContext } from 'karboai';

import { outputException } from '../../lib/snippets';
import { findUuid, getAddQuery } from '../../lib/util';
import { getCreateUser, prisma } from '../../lib/prisma';
import { addQueries } from '../../../public/data/constants.json';

export const pingCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(message.chatId, 'pong', message.messageId);
};

export const addCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');

  const value = Number(splittedContent[2]);
  const query = addQueries[splittedContent[1] as keyof typeof addQueries];

  if (!query) {
    await outputException({ karbo, message }, 'enterCorrectQuery');
    return;
  }

  if (isNaN(value)) {
    await outputException({ karbo, message }, 'enterCorrectAmount');
    return;
  }

  const uuid = findUuid(message.content);
  let target;

  if (!uuid) {
    await outputException({ karbo, message }, 'enterCorrectUser');
    return;
  }

  try {
    target = await karbo.user(uuid[0]);
  } catch {
    await outputException({ karbo, message }, 'enterCorrectUser');
    return;
  }

  await getCreateUser(target.userId, target.nickname);

  await prisma.user.update({
    data: getAddQuery(query, value),
    where: { id: target.userId },
  });

  await karbo.text(
    message.chatId,
    `Вы применили настройки на ${bold(target.nickname)}`,
    message.messageId,
  );
};
