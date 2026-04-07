import { KarboContext } from 'karboai';

import { getCreateUser } from '../../lib/prisma';
import { level } from '../../lib/util';
import { drawCreditCard, drawProfile } from '../../lib/canvas';
import { WORKS_RECORD } from '../../constants';
import { staticValues } from '../../../public/data/constants.json';

export const meCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { stats: true, couple: true },
  );

  const levelInfo = level(user.stats!.experience);

  const image = await drawProfile({
    nickname: message.author.nickname,
    level: levelInfo.level,
    frame: user.currentFrame,
    experience: {
      from: user.stats!.experience,
      to: levelInfo.maxExperience,
    },
    avatar: message.author.avatarUrl,
    stats: {
      messages: user.stats!.messages,
      robs: user.stats!.robs,
      duels: user.stats!.duels,
    },
    work: user.work ? WORKS_RECORD[user.work].name : staticValues.work,
    reputation: user.stats!.reputation,
    background: user.currentBackground || undefined,
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};

export const bankCallback = async ({ karbo, message }: KarboContext) => {
  const user = await getCreateUser(
    message.author.userId,
    message.author.nickname,
    { card: true },
  );

  const image = await drawCreditCard({
    cardNumber: user.card!.number,
    initials: user.card!.initials,
    date: user.card!.date,
    balance: user.card!.balance,
    cash: user.card!.cash,
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};
