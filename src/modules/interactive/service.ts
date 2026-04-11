import { bold, code, KarboContext } from 'karboai';

import { BooleanValue, ReputationAction } from '../../schemas/interactive';
import {
  repActionsMap,
  delays,
  robActionsMap,
  queries,
} from '../../../public/data/constants.json';
import {
  outputException,
  outputRelativeTime,
  validateUser,
} from '../../lib/snippets';
import { getCreateUser, prisma } from '../../lib/prisma';
import {
  generateRepReward,
  generateReputationDecrease,
  generateRobReward,
  isRobbed,
} from '../../lib/util';

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

export const duelCallback = async ({ karbo, message }: KarboContext) => {};
