import { bold, KarboContext } from 'karboai';

import { ErrorsMap } from '../schemas/interactive';
import { ERRORS_MAP } from '../constants';
import { getRelative } from './util';

export const outputException = async (
  context: KarboContext,
  exception: ErrorsMap,
): Promise<void> => {
  await context.karbo.text(
    context.message.chatId,
    ERRORS_MAP[exception as keyof typeof ERRORS_MAP],
  );
};

export const outputRelativeTime = async (
  context: KarboContext,
  relativeTime: number,
): Promise<void> => {
  await context.karbo.text(
    context.message.chatId,
    `Вы сможете использовать эту команду только ${bold(getRelative(relativeTime))}`,
    context.message.messageId,
  );
};
