import type { MessageCallback } from 'karboai';

import { getUser } from '../../util/prisma';
import { profile } from '../../util/canvas';
import { DEFAULT_WORK, WORKS_RECORD } from '../../constants';
import { calculateLevel } from '../../util/helpers';
import type { BackgroundKey, FrameKey } from '../../types/canvas';

export const me: MessageCallback = async ({ karbo, message }) => {
  const user = await getUser({ user: message.author, include: { stats: true } });
  const { level, maxExperience } = calculateLevel(user.stats!.experience);

  const media = await karbo.upload(
    await profile({
      nickname: message.author.nickname,
      work: !user.work && user.work != 0 ? DEFAULT_WORK : WORKS_RECORD[user.work]!.name,
      frame: user.frame as FrameKey,
      background: user.background as BackgroundKey,
      level,
      experience: {
        from: user.stats!.experience,
        to: maxExperience,
      },
      reputation: user.stats!.reputation,
      avatar: message.author.avatarUrl,
      stats: user.stats!,
    })
  );

  await karbo.image({ chatId: message.chatId, images: [media], replyMessageId: message.messageId });
};
