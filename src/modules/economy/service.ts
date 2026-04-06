import { bold, KarboContext } from 'karboai';

import { DELAYS, WORKS_RECORD, WORKS_STRING } from '../../constants';
import { getCreateUser, prisma } from '../../lib/prisma';
import { outputException, outputRelativeTime } from '../../lib/snippets';
import { generateDaily } from '../../lib/util';
import { UserWithStats } from '../../schemas/prisma';

const setWork = async (
  context: KarboContext,
  user: UserWithStats,
  workId: string,
) => {
  const work = WORKS_RECORD[workId];

  if (!work) {
    await outputException(
      { karbo: context.karbo, message: context.message },
      'WORK_NOT_FOUND',
    );
    return;
  }

  if (user.work == workId) {
    await outputException(
      { karbo: context.karbo, message: context.message },
      'ALREADY_WORKING',
    );
    return;
  }

  if (user.stats!.reputation < work.minReputation) {
    await outputException(
      { karbo: context.karbo, message: context.message },
      'NOT_ENOUGH_REPUTATION',
    );
    return;
  }

  await prisma.user.update({
    data: { work: workId },
    where: { id: context.message.author.userId },
  });
  await context.karbo.text(
    context.message.chatId,
    `Вы успешно устроились на работу - ${bold(work.name)}`,
    context.message.messageId,
  );
};

export const worksListCallback = async ({ karbo, message }: KarboContext) => {
  await karbo.text(message.chatId, WORKS_STRING, message.messageId);
};

export const workCallback = async ({ karbo, message }: KarboContext) => {
  const splittedContent = message.content.split(' ');

  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true, stats: true },
  );

  if (splittedContent[1]) {
    await setWork({ karbo, message }, user, splittedContent[1]);
    return;
  }

  const work = WORKS_RECORD[user.work!];

  if (!work) {
    await outputException({ karbo, message }, 'NO_WORK');
    return;
  }

  if (work.minReputation > user.stats!.reputation) {
    await outputException({ karbo, message }, 'GET_FIRED');
    await prisma.user.update({
      where: {
        id: message.author.userId,
      },
      data: {
        work: null,
      },
    });
    return;
  }

  const timestamp = Date.now();

  if (timestamp < user.schedule!.canWorkAt) {
    await outputRelativeTime(
      { karbo, message },
      timestamp - Number(user.schedule!.canWorkAt),
    );
    return;
  }

  await prisma.user.update({
    where: {
      id: message.author.userId,
    },
    data: {
      card: { update: { cash: { increment: work.salary } } },
      schedule: {
        update: { canWorkAt: timestamp + DELAYS.work },
      },
    },
  });

  await karbo.text(
    message.chatId,
    `Вы отработали и получили ${bold(work.salary.toString())} гемов за рабочий день!`,
    message.messageId,
  );
};

export const dailyCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true },
  );
  const timestamp = Date.now();

  if (timestamp < user.schedule!.canDailyAt) {
    await outputRelativeTime(
      { karbo, message },
      timestamp - Number(user.schedule!.canDailyAt),
    );
    return;
  }

  const reward = generateDaily();

  await prisma.user.update({
    where: {
      id: message.author.userId,
    },
    data: {
      card: {
        update: { cash: { increment: reward } },
      },
      schedule: { update: { canDailyAt: timestamp + DELAYS.daily } },
    },
  });

  await karbo.text(
    message.chatId,
    `За ежедневную награду вы заработали ${reward} гемов`,
    message.messageId,
  );
};
