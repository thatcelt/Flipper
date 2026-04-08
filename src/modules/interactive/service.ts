import { bold, code, KarboContext } from 'karboai';

import { ReputationAction } from '../../schemas/interactive';
import { repActionsMap, delays } from '../../../public/data/constants.json';
import { outputException, outputRelativeTime } from '../../lib/snippets';
import { getCreateUser, prisma } from '../../lib/prisma';
import { generateRepReward } from '../../lib/util';

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
