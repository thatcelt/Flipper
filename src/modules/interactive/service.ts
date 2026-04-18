import { bold, code, KarboContext } from 'karboai';

import { BooleanValue, ReputationAction } from '../../schemas/interactive';
import {
  repActionsMap,
  delays,
  robActionsMap,
  queries,
  duelEventCallbacks,
  topCategories,
} from '../../../public/data/constants.json';
import {
  outputException,
  outputRelativeTime,
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
  isDuelWon,
  isRobbed,
  randomElement,
  truncate,
} from '../../lib/util';
import { UserWithStatsCard } from '../../schemas/prisma';
import { drawTop } from '../../lib/canvas';
import { TopMap } from '../../schemas/canvas';

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
  const reputationLoss = Math.floor(reward / 2);

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

export const marryCallback = async ({ karbo, message }: KarboContext) => {};
