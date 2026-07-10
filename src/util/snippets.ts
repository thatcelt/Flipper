import { bold, code, type User } from 'karboai';

import { FLATTED_CATEGORIES, WORKS_RECORD } from '../constants';
import errors from '../../public/data/errors.json';
import { findUuid, getRelativeTime } from './helpers';
import prisma, { getUser } from './prisma';
import shop from '../../public/data/shop.json';
import type {
  DisplayErrorBuilder,
  FindCosmeticsBuilder,
  FindProductBuilder,
  HasEnoughMoneyBuilder,
  IsScheduledBuilder,
  Product,
  UpdateWorkBuilder,
  ValidateUserBuilder,
} from '../types/snippets';

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
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  if (!shop[type].includes(productId)) {
    await displayError({
      karbo,
      key: 'invalidProductType',
      chatId: message.chatId,
      messageId: message.messageId,
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
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  return product;
};

export const displayError = async ({ karbo, key, chatId, messageId }: DisplayErrorBuilder) => {
  await karbo.text({
    chatId,
    replyMessageId: messageId,
    content: `Ошибка: ${code(errors[key])}`,
  });
};

export const isScheduled = async ({
  karbo,
  dataSource: { chatId, messageId },
  scheduledTime,
}: IsScheduledBuilder): Promise<boolean | undefined> => {
  const timestamp = Date.now();

  if (scheduledTime < timestamp) return;

  await karbo.text({
    chatId,
    replyMessageId: messageId,
    content: `Вы сможете использовать эту команду только ${code(getRelativeTime(Number(scheduledTime)))}`,
  });

  return true;
};

export const getUserIfEnoughMoney = async ({
  karbo,
  dataSource: { content, chatId, messageId, author },
  type,
}: HasEnoughMoneyBuilder) => {
  const [, rawAmount] = content.split(' ');

  if (!rawAmount) {
    await displayError({ karbo, key: 'wrongType', chatId, messageId });
    return;
  }

  const amount = parseFloat(rawAmount);

  if (isNaN(amount) || amount <= 0) {
    await displayError({ karbo, key: 'wrongType', chatId, messageId });
    return;
  }

  const user = await getUser({ user: author, include: { card: true } });

  if (user.card![type] < amount) {
    await displayError({ karbo, key: 'notEnoughMoney', chatId, messageId });
    return;
  }

  return { user, amount };
};

export const validateUser = async ({
  karbo,
  message,
}: ValidateUserBuilder): Promise<User | undefined> => {
  const uuid = findUuid(message.content.split(' ')[2] || '')?.[0]; // shitcode

  if (!uuid || uuid == process.env.BOT_ID || uuid == message.author.userId) {
    await displayError({
      karbo,
      key: 'wrongUser',
      chatId: message.chatId,
      messageId: message.messageId,
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
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  if (workId == user.work) {
    await displayError({
      karbo,
      key: 'alreadyWorking',
      chatId: message.chatId,
      messageId: message.messageId,
    });
    return;
  }

  if (work.minReputation > user.stats!.reputation) {
    await displayError({
      karbo,
      key: 'notEnoughReputation',
      chatId: message.chatId,
      messageId: message.messageId,
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
