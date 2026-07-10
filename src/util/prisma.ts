import { PrismaMariaDb } from '@prisma/adapter-mariadb';

import { PrismaClient } from '../../generated/prisma/client';
import {
  initStats,
  incrementStats,
  defaultProducts,
  incrementExperience,
} from '../../public/data/prisma.json';
import { cardDate, cardNumber } from './helpers';
import type { UpdateCashBuilder, UserBuilder } from '../types/prisma';

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
      upgrade: { create: {} },
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

export default prisma;
