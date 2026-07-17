import type { InteractionCallback, KarboAI, Message, MessageCallback } from 'karboai';

import { topOrder } from '../../../public/data/prisma.json';
import prisma, { buildRobQueries, getUser } from '../../util/prisma';
import { displayError, isScheduled, sendDuelTurn, validateUser } from '../../util/snippets';
import {
  getAvatarUrl,
  isRobbed,
  parseValue,
  randomUser,
  robLog,
  truncate,
} from '../../util/helpers';
import { CHANGE_REP_MAP, COOLDOWNS, TOP_CATEGORIES } from '../../constants';
import { top } from '../../util/canvas';
import {
  createDuel,
  decrementHealth,
  getDuel,
  incrementDeck,
  incrementIce,
  inDuel,
  writeToHistory,
} from '../../util/duels';
import { buildDuel } from '../../util/buttons';
import type { UserOrderByWithRelationInput } from '../../../generated/prisma/models';
import type { TopEntity, TopKey } from '../../types/canvas';
import type { InteractionMiddleware } from 'karboai/dist/types/dispatcher';

const REQUESTS_CACHE = new Map<string, string>();

export const duelMiddleware: InteractionMiddleware = async ({ query }) => {
  const [_, duelId] = query.buttonId.split('_');

  const duel = getDuel(duelId);

  if (duel && duel.turn == query.userId && !duel.isFinished) return true;
};

export const requestMiddleware: InteractionMiddleware = async ({ query }) => {
  const [_, userId] = query.buttonId.split('_');

  if (userId == query.userId && REQUESTS_CACHE.get(query.userId)) {
    REQUESTS_CACHE.delete(query.userId);
    return true;
  }
};

const changeReputation = async (
  karbo: KarboAI,
  message: Message,
  action: 'increment' | 'decrement'
) => {
  const user = await getUser({ user: message.author, include: { schedule: true } });

  if (await isScheduled({ karbo, dataSource: message, scheduledTime: user.schedule!.canRepAt }))
    return;

  if (!message.replyMessageId) {
    await displayError({
      karbo,
      key: 'wrongUser',
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  const target = await validateUser({
    karbo,
    message,
    userId: (await karbo.message(message.chatId, message.replyMessageId)).author.userId,
  });

  if (!target) return;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: message.author.userId },
      data: { schedule: { update: { canRepAt: Date.now() + COOLDOWNS.rep } } },
    }),
    prisma.user.update({
      where: { id: target.userId },
      data: { stats: { update: { reputation: { [action]: 1 } } } },
    }),
  ]);

  await karbo.text({
    chatId: message.chatId,
    content: `Вы ${CHANGE_REP_MAP[action]} репутацию ${target.nickname}!`,
  });
};

export const rob: MessageCallback = async ({ karbo, message }) => {
  const user = await getUser({ user: message.author, include: { schedule: true } });

  if (await isScheduled({ karbo, dataSource: message, scheduledTime: user.schedule!.canRobAt }))
    return;

  const target = await validateUser({ karbo, message });

  if (!target) return;

  const targetCard = await prisma.card.findFirst({ where: { ownerId: target.userId } });

  const robResult = isRobbed();
  const { reward, reputationDecrease, args } = buildRobQueries({
    userId: message.author.userId,
    targetId: target.userId,
    result: robResult,
    maxCash: targetCard!.cash,
  });

  await prisma.$transaction(args);

  await karbo.text({
    chatId: message.chatId,
    content: robLog(robResult, reward, reputationDecrease),
    replyMessageId: message.messageId,
  });
};

export const increaseReputation: MessageCallback = async ({ karbo, message }) => {
  await changeReputation(karbo, message, 'increment');
};

export const decreaseReputation: MessageCallback = async ({ karbo, message }) => {
  await changeReputation(karbo, message, 'decrement');
};

export const _top: MessageCallback = async ({ karbo, message }) => {
  const [, category] = message.content.split(' ');

  if (!TOP_CATEGORIES.includes(category!)) {
    await displayError({
      karbo,
      key: 'wrongType',
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  const users: TopEntity[] = await Promise.all(
    (
      await prisma.user.findMany({
        orderBy: topOrder[category as keyof typeof topOrder] as UserOrderByWithRelationInput, // fuck this shit
        take: 6,
        select: { stats: true, card: true, id: true },
      })
    ).map(async (user) => {
      const target = await karbo.user(user.id, message.communityId);

      return {
        avatar: getAvatarUrl(target.avatar),
        nickname: target.nickname,
        value: parseValue({ stats: user.stats!, card: user.card!, id: user.id }, category!),
      };
    })
  );

  const winners = [users[1], users[0], users[2]].map((user) => {
    return { ...user!, nickname: truncate(user!.nickname) };
  });

  const media = await karbo.upload(
    await top({ secondaries: users.slice(3), winners, key: `top-top-${category}` as TopKey })
  );

  await karbo.image({
    images: [media],
    chatId: message.chatId,
    replyMessageId: message.messageId,
  });
};

export const duel: MessageCallback = async ({ karbo, message }) => {
  if (inDuel(message.author.userId)) {
    await displayError({
      karbo,
      key: 'alreadyInDuel',
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  const user = await getUser({ user: message.author, include: { schedule: true } });

  if (await isScheduled({ karbo, dataSource: message, scheduledTime: user.schedule!.canDuelAt }))
    return;

  const target = await validateUser({ karbo, message });

  if (!target) return;

  if (REQUESTS_CACHE.get(target.userId)) {
    await displayError({
      karbo,
      key: 'alreadyRequested',
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  const targetSchedules = await prisma.schedule.findFirst({ where: { userId: target.userId } });

  if (
    await isScheduled({
      karbo,
      dataSource: message,
      scheduledTime: targetSchedules!.canDuelAt,
      other: true,
    })
  )
    return;

  if (inDuel(target.userId)) {
    await displayError({
      karbo,
      key: 'userAlreadyInDuel',
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  REQUESTS_CACHE.set(target.userId, message.author.userId);

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `${message.author.nickname} вызывает ${target.nickname} на цифровую дуэль! Примет ли оппонент вызов? ${target.nickname}, делай свой выбор!`,
    inlineButtons: buildDuel(target.userId),
  });
};

export const accept: InteractionCallback = async ({ karbo, query }) => {
  const oppositeUserId = REQUESTS_CACHE.get(query.buttonId.split('_')[1]!)!;

  if (inDuel(oppositeUserId)) {
    await displayError({
      karbo,
      key: 'alreadyInDuel',
      chatId: query.chatId,
    });
    return;
  }

  if (inDuel(query.userId)) {
    await displayError({
      karbo,
      key: 'alreadyInDuel',
      chatId: query.chatId,
    });
    return;
  }

  const [author, target] = await Promise.all([
    karbo.user(oppositeUserId, query.communityId),
    karbo.user(query.userId, query.communityId),
  ]);

  const [authorStats, targetStats] = await prisma.$transaction([
    prisma.stats.findFirst({
      where: { userId: author.userId },
      select: { deck: true, ice: true, perk: true },
    }),
    prisma.stats.findFirst({
      where: { userId: target.userId },
      select: { deck: true, ice: true, perk: true },
    }),
  ]);

  const turn = randomUser([author, target]);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: author.userId },
      data: { schedule: { update: { canDuelAt: Date.now() + COOLDOWNS.duel } } },
    }),
    prisma.user.update({
      where: { id: target.userId },
      data: { schedule: { update: { canDuelAt: Date.now() + COOLDOWNS.duel } } },
    }),
  ]);

  const duel = createDuel(
    [
      {
        id: author.userId,
        avatar: getAvatarUrl(author.avatar),
        nickname: author.nickname,
        stats: authorStats!,
        perk: authorStats!.perk,
      },
      {
        id: target.userId,
        avatar: getAvatarUrl(target.avatar),
        nickname: target.nickname,
        stats: targetStats!,
        perk: targetStats!.perk,
      },
    ],
    turn.userId
  );

  await sendDuelTurn({ karbo, chatId: query.chatId, duelId: duel.id });
};

export const escape: InteractionCallback = async ({ karbo, query }) => {
  const { nickname } = await karbo.user(query.userId);

  await karbo.text({
    content: `${nickname} вместо честного боя тихонько развернулся и дал по педалям в страхе от противника!`,
    chatId: query.chatId,
  });
};

export const punch: InteractionCallback = async ({ karbo, query }) => {
  const duel = getDuel(query.buttonId.split('_')[1]!)!;

  const opponent = duel.users.find((user) => user.id != query.userId)!;

  if (duel.history.at(-1) != 'duel-dodge') decrementHealth(duel.id, opponent.id);
  writeToHistory(duel.id, 'duel-punch');

  await sendDuelTurn({ karbo, chatId: query.chatId, duelId: duel.id });
};

export const dodge: InteractionCallback = async ({ karbo, query }) => {
  const duel = getDuel(query.buttonId.split('_')[1]!)!;

  writeToHistory(duel.id, 'duel-dodge');

  await sendDuelTurn({ karbo, chatId: query.chatId, duelId: duel.id });
};

export const buffIce: InteractionCallback = async ({ karbo, query }) => {
  const duel = getDuel(query.buttonId.split('_')[1]!)!;

  const user = duel.users.find((user) => user.id == query.userId)!;

  for (let i = 0; i < (user.perk == 'ICE' ? 2 : 1); i++) {
    incrementIce(duel.id, query.userId);
  }
  writeToHistory(duel.id, 'duel-ice');

  await sendDuelTurn({ karbo, chatId: query.chatId, duelId: duel.id });
};

export const deck: InteractionCallback = async ({ karbo, query }) => {
  const duel = getDuel(query.buttonId.split('_')[1]!)!;

  const [user, opponent] = [
    duel.users.find((user) => user.id == query.userId)!,
    duel.users.find((user) => user.id != query.userId)!,
  ];

  if (opponent.stats.ice < user.stats.deck + (user.perk == 'DECK' ? 1 : 0))
    decrementHealth(duel.id, opponent.id);

  incrementDeck(duel.id, user.id);
  writeToHistory(duel.id, 'duel-wave');

  await sendDuelTurn({ karbo, chatId: query.chatId, duelId: duel.id });
};
