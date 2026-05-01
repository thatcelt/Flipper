import { bold, code, KarboContext } from 'karboai';

import { BooleanValue, ReputationAction } from '../../schemas/interactive';
import {
  repActionsMap,
  delays,
  robActionsMap,
  queries,
  duelEventCallbacks,
  topCategories,
  marryProductId,
} from '../../../public/data/constants.json';
import {
  outputException,
  outputRelativeTime,
  manageStreakEnd,
  validateUser,
} from '../../lib/snippets';
import { getCreateUser, prisma } from '../../lib/prisma';
import {
  generateDuelReward,
  generateRepReward,
  generateReputationDecrease,
  generateRobReward,
  getAvatarUrl,
  getOrderBy,
  isCoupleStreakEnded,
  isDuelWon,
  isRobbed,
  randomElement,
  truncate,
} from '../../lib/util';
import { UserWithStatsCard } from '../../schemas/prisma';
import { drawTop } from '../../lib/canvas';
import { TopMap } from '../../schemas/canvas';

const marriageCache: Map<string, string> = new Map<string, string>();

const manageReputation = async (
  { karbo, message }: KarboContext,
  action: ReputationAction,
) => {
  if (!message.replyMessageId) {
    await outputException({ karbo, message }, 'needToReply');
    return;
  }

  const repliedMessage = await karbo.message(
    message.chatId,
    message.replyMessageId,
  );

  if (
    [message.author.userId, process.env.BOT_ID].includes(
      repliedMessage.author.userId,
    )
  ) {
    await outputException({ karbo, message }, 'accessDenied');
    return;
  }

  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true },
  );
  const timestamp = Date.now();

  if (user.schedule!.canRepAt > timestamp) {
    await outputRelativeTime(
      { karbo, message },
      Number(user.schedule!.canRepAt) - timestamp,
    );
    return;
  }

  const { text, query } = repActionsMap[action];

  const targetUser = await getCreateUser(
    repliedMessage.author.userId,
    repliedMessage.author.nickname,
  );
  const repReward = generateRepReward();

  await prisma.$transaction([
    prisma.user.update({
      data: {
        stats: { update: { reputation: { [query]: repReward } } },
      },
      where: { id: targetUser.id },
    }),
    prisma.user.update({
      data: { schedule: { update: { canRepAt: Date.now() + delays.rep } } },
      where: { id: user.id },
    }),
  ]);

  await karbo.text(
    message.chatId,
    `Вы ${text} репутацию ${bold(repliedMessage.author.nickname)} на ${code(repReward.toString())}`,
    message.messageId,
  );
};

export const increaseReputationCallback = async ({
  karbo,
  message,
}: KarboContext) => {
  await manageReputation({ karbo, message }, 'increase');
};

export const decreaseReputationCallback = async ({
  karbo,
  message,
}: KarboContext) => {
  await manageReputation({ karbo, message }, 'decrease');
};

export const robCallback = async ({ karbo, message }: KarboContext) => {
  const target = await validateUser({ karbo, message });
  if (!target) return;

  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true },
  );

  const timestamp = Date.now();

  if (user.schedule!.canRobAt > timestamp) {
    await outputRelativeTime(
      { karbo, message },
      Number(user.schedule!.canRobAt) - timestamp,
    );
    return;
  }

  const targetUser = await getCreateUser(target.userId, target.nickname, {
    card: true,
  });
  const isRobbedResult = isRobbed();

  const robReward = isRobbedResult
    ? Math.min(generateRobReward(), targetUser.card!.cash)
    : 0;
  const decreasedReputation = generateReputationDecrease(); // not so ethical

  await prisma.$transaction([
    prisma.user.update({
      data: { card: { update: { cash: { decrement: robReward } } } },
      where: { id: target.userId },
    }),
    prisma.user.update({
      data: {
        schedule: { update: { canRobAt: Date.now() + delays.rob } },
        card: { update: { cash: { increment: robReward } } },
        ...(isRobbedResult
          ? { stats: { update: queries.incrementRobs } }
          : {
              stats: {
                update: {
                  reputation: { decrement: decreasedReputation },
                  ...queries.incrementRobs,
                },
              },
            }),
      },
      where: { id: user.id },
    }),
  ]);

  await karbo.text(
    message.chatId,
    robActionsMap[isRobbedResult.toString() as BooleanValue].replace(
      '%s',
      isRobbedResult ? robReward.toString() : decreasedReputation.toString(),
    ),
    message.messageId,
  );
};

export const duelCallback = async ({ karbo, message }: KarboContext) => {
  const target = await validateUser({ karbo, message });

  if (!target) return;

  const targetUser = await getCreateUser(target.userId, target.nickname, {
    stats: true,
    schedule: true,
  });

  if (!targetUser.stats!.reputation) {
    await outputException({ karbo, message }, 'cantFight');
    return;
  }

  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { schedule: true },
  );

  const timestamp = Date.now();

  for (const canDuelAt of [
    user.schedule!.canDuelAt,
    targetUser.schedule!.canDuelAt,
  ]) {
    if (canDuelAt > timestamp) {
      await outputRelativeTime(
        { karbo, message },
        Number(canDuelAt) - timestamp,
      );

      return;
    }
  }

  const duelResult = isDuelWon();
  const canDuelAt = timestamp + delays.duel;
  const reward = generateDuelReward();
  const reputationLoss = Math.floor(reward / 1.2);

  const positioning = duelResult
    ? [message.author.userId, target.userId]
    : [target.userId, message.author.userId];

  await prisma.$transaction([
    prisma.user.update({
      where: { id: positioning[0] },
      data: {
        schedule: { update: { canDuelAt } },
        stats: {
          update: {
            reputation: { increment: reward },
            ...queries.incrementDuels,
          },
        },
      },
    }),
    prisma.user.update({
      where: { id: positioning[1] },
      data: {
        schedule: { update: { canDuelAt } },
        stats: {
          update: {
            reputation: { decrement: reputationLoss },
            ...queries.incrementDuels,
          },
        },
      },
    }),
  ]);

  await karbo.text(
    message.chatId,
    randomElement(duelEventCallbacks[duelResult.toString() as BooleanValue])
      .replaceAll('%s', message.author.nickname)
      .replaceAll('%f', target.nickname)
      .replace('%i', reward.toString())
      .replace('%d', reputationLoss.toString()),
    message.messageId,
  );
};

export const topCallback = async ({ karbo, message }: KarboContext) => {
  const category = message.content.split(' ')[1];

  if (!topCategories.includes(category)) {
    await outputException({ karbo, message }, 'unknownCategory');
    return;
  }

  const users = await Promise.all(
    (
      await prisma.user.findMany({
        orderBy: getOrderBy(category),
        select:
          category == 'balance'
            ? queries.descBalance
            : { id: true, stats: { select: { [category]: true } } },
        take: 6,
      })
    ).map(async (user) => {
      const userWithFields: UserWithStatsCard = JSON.parse(
        JSON.stringify(user),
      );
      const { avatar, nickname } = await karbo.user(user.id);

      return {
        avatar: getAvatarUrl(avatar),
        nickname,
        value:
          category == 'balance'
            ? userWithFields.card!.balance
            : userWithFields.stats![
                category as keyof typeof userWithFields.stats
              ],
      };
    }),
  );

  const winners = [users[1], users[0], users[2]].map(
    ({ avatar, nickname, value }) => ({
      avatar,
      nickname: truncate(nickname),
      value,
    }),
  );

  const image = await drawTop({
    winners,
    type: `top-${category}` as TopMap,
    secondary: users.slice(3),
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};

export const marryCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
  );

  if (
    !(await prisma.productsOnUsers.findFirst({
      where: { userId: user.id, productId: marryProductId },
    }))
  ) {
    await outputException({ karbo, message }, 'accessDenied');
    return;
  }

  if (user.coupleId) {
    await outputException({ karbo, message }, 'youAlreadyMarried');
    return;
  }

  const targetUserObject = await validateUser({ karbo, message });

  if (!targetUserObject) {
    await outputException({ karbo, message }, 'userNotFound');
    return;
  }

  if (marriageCache.get(targetUserObject!.userId)) {
    await outputException({ karbo, message }, 'userAlreadyRequested');
    return;
  }

  const targetUser = await getCreateUser(
    targetUserObject!.userId,
    targetUserObject!.nickname,
  );

  if (targetUser.coupleId) {
    await outputException({ karbo, message }, 'userAlreadyMarried');
    return;
  }

  marriageCache.set(targetUser.id, user.id);

  await karbo.text(
    message.chatId,
    `${bold(message.author.nickname)} делает предложение руки и сердца для ${bold(targetUserObject.nickname)}\n${bold(targetUserObject.nickname)}, согласен(на) ли ты? ответь на это сообщение либо да, либо нет`,
    message.messageId,
  );
};

export const yesCallback = async ({ karbo, message }: KarboContext) => {
  const targetId = marriageCache.get(message.author.userId);
  if (!targetId) return;

  const couple = await prisma.couple.create({
    data: {
      createdAt: Date.now(),
      answer: message.content,
    },
  });

  await prisma.$transaction([
    prisma.user.update({
      data: { coupleId: couple.id },
      where: { id: message.author.userId },
    }),
    prisma.user.update({
      data: { coupleId: couple.id },
      where: { id: targetId },
    }),
  ]);

  const user = await karbo.user(targetId);

  await karbo.text(
    message.chatId,
    `${bold(message.author.nickname)} и ${bold(user.nickname)} теперь официально находятся в браке! Счастливой совместной жизни!`,
    message.messageId,
  );
  await karbo.text(message.chatId, '🎉');
};

export const noCallback = async ({ karbo, message }: KarboContext) => {
  const targetId = marriageCache.get(message.author.userId);
  if (!targetId) return;

  marriageCache.delete(message.author.userId);
  const user = await karbo.user(targetId);

  await karbo.text(
    message.chatId,
    `Печальные новости...поступил отказ на свадьбу ${bold(message.author.nickname)} от ${bold(user.nickname)}`,
    message.messageId,
  );
};

export const kissCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { couple: true },
  );

  if (!user.coupleId) {
    await outputException({ karbo, message }, 'youHaveNotMarried');
    return;
  }

  const timestamp = Date.now();

  if (user.couple!.canActionAt > timestamp) {
    await outputRelativeTime(
      { karbo, message },
      timestamp - Number(user.couple!.canActionAt),
    );

    return;
  }

  if (
    isCoupleStreakEnded(Number(user.couple!.lastActionAt)) &&
    user.couple!.actionStreak
  ) {
    await manageStreakEnd(
      { karbo, message },
      user.couple!.actionStreak,
      user.couple!.id,
    );
    user.couple!.lastStreakAt = timestamp;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: message.author.userId },
      data: { card: { update: { balance: { increment: 300 } } } },
    }),
    prisma.couple.update({
      data: {
        actionsDone: { increment: 1 },
        canActionAt: timestamp + delays.kiss,
        experience: { increment: 55 },
        lastActionAt: timestamp,
        actionStreak: user.couple!.lastStreakAt
          ? Math.floor(
              (timestamp - user.couple!.lastStreakAt) / (1000 * 60 * 60 * 24),
            ) + 1
          : 1,
      },
      where: { id: user.couple!.id },
    }),
  ]);

  const coupleUser = (
    await prisma.user.findMany({
      where: { coupleId: user.coupleId },
    })
  ).filter((user) => user.id != message.author.userId)[0];

  const coupleUserObject = await karbo.user(coupleUser.id);

  await karbo.text(
    message.chatId,
    `${bold(message.author.nickname)} поцеловал(а) ${bold(coupleUserObject.nickname)} 💋`,
    message.messageId,
  );
};

export const divorceCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { couple: true },
  );

  if (!user.coupleId) {
    await outputException({ karbo, message }, 'youHaveNotMarried');
    return;
  }

  const coupleUser = (
    await prisma.user.findMany({
      where: { coupleId: user.coupleId },
    })
  ).filter((user) => user.id != message.author.userId)[0];

  await prisma.$transaction([
    prisma.user.update({
      data: { card: { update: { balance: { increment: 1000 } } } },
      where: { id: coupleUser.id },
    }),
    prisma.user.update({
      data: { card: { update: { balance: { decrement: 1000 } } } },
      where: { id: message.author.userId },
    }),
    prisma.couple.delete({ where: { id: user.coupleId } }),
  ]);

  const coupleUserObject = await karbo.user(coupleUser.id);

  await karbo.text(
    message.chatId,
    `${bold(message.author.nickname)} развелся(лась) с ${bold(coupleUserObject.nickname)} и заплатил(а) 1000 гемов компенсации...${bold('Объявляем траур')}`,
    message.messageId,
  );
};
