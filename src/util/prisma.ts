import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '../../generated/prisma/client';
import {
  initStats,
  incrementStats,
  defaultProducts,
  incrementExperience,
} from '../../public/data/prisma.json';
import { cardDate, cardNumber, decrementReputation, robReward } from './helpers';
import { COOLDOWNS } from '../constants';
import type { RobQueriesBuilder, UpdateCashBuilder, UserBuilder } from '../types/prisma';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

export const getUser = async ({ user, update, include }: UserBuilder) =>
  await prisma.user.upsert({
    where: { id: user.userId },
    include: include ?? {},
    create: {
      id: user.userId,
      stats: { create: initStats },
      card: { create: { initials: user.nickname, number: cardNumber(), date: cardDate() } },
      schedule: { create: {} },
      products: { createMany: defaultProducts },
    },
    update: update
      ? {
          stats: {
            update: incrementStats,
          },
        }
      : {},
  });

export const incrementCash = async ({ id, increment, schedule }: UpdateCashBuilder) => {
  await prisma.user.update({
    where: { id },
    data: {
      card: { update: { cash: { increment } } },
      stats: incrementExperience,
      schedule,
    },
  });
};

export const buildRobQueries = ({ userId, targetId, result, maxCash }: RobQueriesBuilder) => {
  const reward = robReward(maxCash);
  const decrement = decrementReputation();

  const args = [
    prisma.user.update({
      where: { id: userId },
      data: {
        ...(result
          ? { card: { update: { cash: { increment: reward } } } }
          : { stats: { update: { reputation: { decrement } } } }),
        schedule: { update: { canRobAt: Date.now() + COOLDOWNS.rob } },
      },
    }),
  ];

  if (result) {
    args.push(
      prisma.user.update({
        where: { id: targetId },
        data: {
          card: { update: { cash: { decrement: reward } } },
        },
      })
    );
  }

  return {
    reputationDecrease: decrement,
    reward,
    args,
  };
};

export default prisma;
