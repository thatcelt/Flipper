import { type InteractionCallback, type MessageCallback } from 'karboai';

import { clanId } from '../../../public/data/shop.json';
import {
  changeBackground,
  changeFrame,
  displayError,
  getClanIfHas,
  getClanIfOwner,
  validateUser,
} from '../../util/snippets';
import prisma from '../../util/prisma';
import { clanTop } from '../../../public/data/prisma.json';
import { CLAN_FIELDS } from '../../constants';
import { buildInvite } from '../../util/buttons';
import { clan as drawClan } from '../../util/canvas';
import { calculateLevel, getAvatarUrl } from '../../util/helpers';
import type { ClanFields } from '../../types/snippets';
import type { InteractionMiddleware } from 'karboai/dist/types/dispatcher';
import type { BackgroundKey, FrameKey } from '../../types/canvas';

const inviteCache = new Map<string, string>();

export const inviteMiddleware: InteractionMiddleware = async ({
  query,
}): Promise<boolean | undefined> => {
  if (inviteCache.get(query.userId)) return true;
};

export const _clan: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const { clan } = (await prisma.user.findUnique({
    where: { id: message.author.userId },
    include: { clan: true },
  }))!;

  if (!clan) {
    await displayError({ karbo, source: message, key: 'notInClan' });
    return;
  }

  const [messagesTop, experienceTop] = await prisma.$transaction([
    prisma.user.findMany({
      where: { clanId: clan.id },
      orderBy: { stats: { messages: 'desc' } },
      ...clanTop,
    }),
    prisma.user.findMany({
      where: { clanId: clan.id },
      orderBy: { stats: { experience: 'desc' } },
      ...clanTop,
    }),
  ]);

  const { level, maxExperience } = calculateLevel(clan.experience);

  const media = await karbo.upload(
    await drawClan({
      name: clan.title,
      chatLink: clan.chatLink || 'Отсутствует',
      avatar: clan.icon,
      participants: await prisma.user.count({ where: { clanId: clan.id } }),
      frame: clan.frame as FrameKey,
      background: `backgrounds-${clan.background}` as BackgroundKey,
      experience: {
        from: clan.experience,
        to: maxExperience,
      },
      level,
      top: {
        messages: await Promise.all(
          [messagesTop[1], messagesTop[0], messagesTop[2]].map(async (topUser) => {
            if (!topUser) return;

            const { avatar } = await karbo.user(topUser?.id, message.communityId);

            return getAvatarUrl(avatar);
          })
        ),
        experience: await Promise.all(
          [experienceTop[1], experienceTop[0], experienceTop[2]].map(async (topUser) => {
            if (!topUser) return;

            const { avatar } = await karbo.user(topUser?.id, message.communityId);

            return getAvatarUrl(avatar);
          })
        ),
      },
    })
  );

  await karbo.image({ chatId: message.chatId, replyMessageId: message.messageId, images: [media] });
};

export const create: MessageCallback = async ({ karbo, message }): Promise<void> => {
  if (!message.images?.length) {
    await displayError({ karbo, source: message, key: 'wrongImage' });
    return;
  }

  const [, title] = message.content.split('/create-clan ');

  if (!title) {
    await displayError({ karbo, source: message, key: 'wrongValue' });
    return;
  }

  if (
    !(await prisma.productsOnUser.findFirst({
      where: { userId: message.author.userId, productId: clanId },
    }))
  ) {
    await displayError({ karbo, source: message, key: 'forbidden' });
    return;
  }

  if (
    await prisma.user.findFirst({
      where: { id: message.author.userId, clanId: { not: null } },
    })
  ) {
    await displayError({ karbo, key: 'alreadyInClan', source: message });
    return;
  }

  const clan = await prisma.clan.create({
    data: { ownerId: message.author.userId, title, icon: message.images[0]! },
  });

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { clanId: clan.id },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Поздравляю вас с созданием клана ${clan.title}`,
  });
};

export const edit: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const clan = await getClanIfOwner({ karbo, message });

  if (!clan) return;

  const [, field] = message.content.split(' ');

  if (!CLAN_FIELDS.includes(field as ClanFields)) {
    await displayError({ karbo, source: message, key: 'wrongField' });
    return;
  }

  const [, value] = message.content.split(`/edit-clan ${field} `);

  if (field == 'icon' && !message.images?.length) {
    await displayError({ karbo, source: message, key: 'wrongImage' });
    return;
  } else if (!value && field != 'icon') {
    await displayError({ karbo, source: message, key: 'wrongValue' });
    return;
  }

  await prisma.clan.update({
    where: { id: clan.id },
    data: { [field as ClanFields]: value || message.images![0]! },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Вы успешно обновили поле ${field}`,
  });
};

export const _delete: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const clan = await getClanIfOwner({ karbo, message });

  if (!clan) return;

  await prisma.clan.delete({ where: { id: clan.id } });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Ваш клан ${clan.title} был официально распущен`,
  });
};

export const invite: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const clan = await getClanIfOwner({ karbo, message });

  if (!clan) return;

  const user = await validateUser({ karbo, message });

  if (!user) return;

  if (inviteCache.get(user.userId)) {
    await displayError({ karbo, source: message, key: 'alreadyInvited' });
    return;
  }

  if (await prisma.user.findFirst({ where: { id: user.userId, clanId: { not: null } } })) {
    await displayError({ karbo, source: message, key: 'userAlreadyInClan' });
    return;
  }

  inviteCache.set(user.userId, message.author.userId);

  await karbo.text({
    content: `${user.nickname}, тебя приглашают присоединиться в клан ${clan.title}. Согласен ли ты?`,
    chatId: message.chatId,
    inlineButtons: buildInvite(user.userId),
  });
};

export const setFrame: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const clan = await getClanIfOwner({ karbo, message });

  if (!clan) return;

  const frame = await changeFrame({ karbo, message, type: 'clan' });

  if (!frame) return;

  await prisma.clan.update({
    where: { id: clan.id },
    data: { frame },
  });
};

export const setBackground: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const clan = await getClanIfOwner({ karbo, message });

  if (!clan) return;

  const background = await changeBackground({ karbo, message, type: 'clan' });

  if (!background) return;

  await prisma.clan.update({
    where: { id: clan.id },
    data: { background },
  });
};

export const leave: MessageCallback = async ({ karbo, message }): Promise<void> => {
  const clan = await getClanIfHas({ karbo, message });

  if (!clan) return;

  if (clan.ownerId == message.author.userId) {
    await displayError({ karbo, source: message, key: 'cantLeave' });
    return;
  }

  await prisma.user.update({
    where: { id: message.author.userId },
    data: { clan: { disconnect: true } },
  });

  await karbo.text({
    chatId: message.chatId,
    replyMessageId: message.messageId,
    content: `Вы покинули клан ${clan.title}`,
  });
};

export const accept: InteractionCallback = async ({ karbo, query }): Promise<void> => {
  const clan = (await prisma.clan.findUnique({
    where: { ownerId: inviteCache.get(query.userId)! },
  }))!;

  inviteCache.delete(query.userId);

  await prisma.user.update({
    where: { id: query.userId },
    data: { clan: { connect: { id: clan.id } } },
  });

  const user = await karbo.user(query.userId, query.communityId);

  await karbo.text({
    chatId: query.chatId,
    content: `${user.nickname} официально вступил в клан ${clan.title}`,
  });
};

export const decline: InteractionCallback = async ({ karbo, query }): Promise<void> => {
  inviteCache.delete(query.userId);

  const user = await karbo.user(query.userId, query.communityId);

  await karbo.text({
    chatId: query.chatId,
    content: `${user.nickname} отказался принимать приглашение в клан`,
  });
};
