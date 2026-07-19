import { bold, code, type User } from 'karboai';

import { FLATTED_CATEGORIES, TIME, WORKS_RECORD } from '../constants';
import errors from '../../public/data/errors.json';
import { findUuid, duelReward, getRelativeTime } from './helpers';
import prisma, { getUser } from './prisma';
import shop from '../../public/data/shop.json';
import { finishDuel, getDuel, setTurn } from './duels';
import { fight } from './canvas';
import { buildDuelTurn } from './buttons';
import type {
  BasicBuilder,
  CheckStreakBuilder,
  DisplayErrorBuilder,
  DuelTurnBuilder,
  FindCosmeticsBuilder,
  FindProductBuilder,
  HasEnoughMoneyBuilder,
  IsScheduledBuilder,
  Product,
  UpdateWorkBuilder,
  ValidateUserBuilder,
} from '../types/snippets';
import { message } from '../modules/common/service';
import type { Clan, Couple } from '../../generated/prisma/client';

const findProduct = async ({
  karbo,
  message,
  type,
  products,
}: FindProductBuilder): Promise<Product | undefined> => {
  const [, rawProductId] = message.content.split(' ');

  const productId = Number(rawProductId);
  const product = products.find((product) => product.id === productId);

  if (!product) {
    await displayError({
      karbo,
      key: 'productNotFound',
      source: message,
    });
    return;
  }

  if (!shop[type].includes(productId)) {
    await displayError({
      karbo,
      key: 'invalidProductType',
      source: message,
    });
    return;
  }

  if (
    !(await prisma.productsOnUser.findFirst({
      where: { userId: message.author.userId, productId },
    }))
  ) {
    await displayError({
      karbo,
      key: 'productNotOwned',
      source: message,
    });
    return;
  }

  return product;
};

export const displayError = async ({
  karbo,
  key,
  source: { chatId, messageId },
}: DisplayErrorBuilder) => {
  await karbo.text({
    chatId,
    replyMessageId: messageId,
    content: `Ошибка: ${code(errors[key])}`,
  });
};

export const isScheduled = async ({
  karbo,
  source: { chatId, messageId },
  scheduledTime,
  other,
}: IsScheduledBuilder): Promise<boolean | undefined> => {
  const timestamp = Date.now();

  if (scheduledTime < timestamp) return;

  await karbo.text({
    chatId,
    replyMessageId: messageId,
    content: `${other ? 'Другой пользователь сможет' : 'Вы сможете'} использовать эту команду только ${code(getRelativeTime(Number(scheduledTime)))}`,
  });

  return true;
};

export const getUserIfEnoughMoney = async ({ karbo, source, type }: HasEnoughMoneyBuilder) => {
  const [, rawAmount] = source.content.split(' ');

  if (!rawAmount) {
    await displayError({ karbo, key: 'wrongType', source });
    return;
  }

  const amount = parseFloat(rawAmount);

  if (isNaN(amount) || amount <= 0) {
    await displayError({ karbo, key: 'wrongType', source });
    return;
  }

  const user = await getUser({ user: source.author, include: { card: true } });

  if (user.card![type] < amount) {
    await displayError({ karbo, key: 'notEnoughMoney', source });
    return;
  }

  return { user, amount };
};

export const validateUser = async ({
  karbo,
  message,
  userId,
}: ValidateUserBuilder): Promise<User | undefined> => {
  const uuid = userId ?? findUuid(message.content)?.[0]; // shitcode

  if (!uuid || uuid == process.env.BOT_ID || uuid == message.author.userId) {
    await displayError({
      karbo,
      key: 'wrongUser',
      source: message,
    });
    return;
  }

  const user = await karbo.user(uuid, message.communityId);

  await getUser({ user: user });

  return user;
};

export const updateWork = async ({ karbo, message, user, rawWorkId }: UpdateWorkBuilder) => {
  const workId = Number(rawWorkId);

  const work = WORKS_RECORD[workId];

  if (!work) {
    await displayError({
      karbo,
      key: 'workNotFound',
      source: message,
    });
    return;
  }

  if (workId == user.work) {
    await displayError({
      karbo,
      key: 'alreadyWorking',
      source: message,
    });
    return;
  }

  if (work.minReputation > user.stats!.reputation) {
    await displayError({
      karbo,
      key: 'notEnoughReputation',
      source: message,
    });
    return;
  }

  await prisma.user.update({
    data: { work: workId },
    where: { id: message.author.userId },
  });
  await karbo.text({
    chatId: message.chatId,
    content: `Вы успешно устроились на работу - ${bold(work.name)}`,
    replyMessageId: message.messageId,
  });
};

export const findFrame = async ({ karbo, message, type }: FindCosmeticsBuilder) => {
  return await findProduct({ karbo, message, type, products: FLATTED_CATEGORIES.frames });
};

export const findBackground = async ({ karbo, message, type }: FindCosmeticsBuilder) => {
  return await findProduct({ karbo, message, type, products: FLATTED_CATEGORIES.backgrounds });
};

export const findCardColor = async ({ karbo, message, type }: FindCosmeticsBuilder) => {
  return await findProduct({ karbo, message, type, products: FLATTED_CATEGORIES.cards });
};

export const sendDuelTurn = async ({ karbo, chatId, duelId }: DuelTurnBuilder) => {
  const duel = getDuel(duelId);

  if (!duel) return;

  const newTurn = await karbo.user(duel.users.find((user) => user.id != duel.turn)?.id!);

  const killed = duel.users
    .map((user, index) => ({ user, index }))
    .filter(({ user }) => user.health == 0)?.[0]?.index;

  let extended: string | undefined = undefined;

  if (killed != undefined) {
    finishDuel(duel.id);

    const { reputation, balance } = duelReward();

    const loser = duel.users[killed]!;
    const winner = duel.users.find((_, index) => index !== killed)!;

    await prisma.$transaction(
      [
        { user: winner, action: 'increment' },
        { user: loser, action: 'decrement' },
      ].map(({ user, action }) =>
        prisma.user.update({
          where: { id: user.id },
          data: {
            stats: { update: { reputation: { [action]: reputation }, duels: { increment: 1 } } },
            card: { update: { balance: { [action]: balance } } },
          },
        })
      )
    );

    extended = `${bold('Итоги дуэли')}:\n\n${winner.nickname} получил ${code(reputation.toString())} репутации и ${code(balance.toString())} фликов за бой\n\nа ${loser.nickname} потерял столько же`;
  } else {
    setTurn(duel.id, newTurn.userId);
  }

  const media = await karbo.upload(
    await fight({
      users: duel.users,
      history: duel.history,
      killed: killed != undefined ? killed + 1 : undefined,
    })
  );

  await karbo.image({
    chatId,
    images: [media],
    caption: extended ? extended : `Ходит: ${newTurn.nickname}`,
    inlineButtons: killed != undefined ? undefined : buildDuelTurn(duel.id),
  });
};

export const checkStreak = async (builder: CheckStreakBuilder): Promise<Couple | undefined> => {
  if (Date.now() - Number(builder.couple.lastKissAt) > TIME.day && builder.couple.kissStreak) {
    await builder.karbo.text({
      content: `С последнего вашего с парой поцелуя прошло больше дня и ваш стрик сбросился..`,
      chatId: builder.message.chatId,
      replyMessageId: builder.message.messageId,
    });

    return await prisma.couple.update({
      where: { id: builder.couple.id },
      data: { kissStreak: 0, lastStreakAt: Date.now() },
    });
  }

  if (
    Math.floor((Date.now() - Number(builder.couple.lastStreakAt)) / TIME.day) >
    builder.couple.kissStreak
  ) {
    return await prisma.couple.update({
      where: { id: builder.couple.id },
      data: { kissStreak: { increment: 1 } },
    });
  }
};

export const getClanIfOwner = async ({
  karbo,
  message,
}: BasicBuilder): Promise<Clan | undefined> => {
  const clan = await prisma.clan.findFirst({ where: { ownerId: message.author.userId } });

  if (!clan) {
    await displayError({
      karbo,
      source: message,
      key: 'forbidden',
    });
    return;
  }

  return clan;
};

export const getClanIfHas = async ({ karbo, message }: BasicBuilder): Promise<Clan | undefined> => {
  const user = await prisma.user.findUnique({
    where: { id: message.author.userId },
    select: { clan: true },
  });

  if (!user?.clan) {
    await displayError({
      karbo,
      source: message,
      key: 'notInClan',
    });
    return;
  }

  return user.clan;
};
