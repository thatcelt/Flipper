import { KarboContext } from 'karboai';

import { getCreateUser } from '../../lib/prisma';
import { level } from '../../lib/util';
import { drawProfile } from '../../lib/canvas';

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
    work: 'Безработный', // will change later
    reputation: user.stats!.reputation,
    background: user.currentBackground || undefined,
  });

  await karbo.image(
    message.chatId,
    [await karbo.upload(image)],
    message.messageId,
  );
};
