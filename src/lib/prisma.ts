import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

import { IncludeUser } from '../schemas/prisma';
import { generateCardDate, generateCardNumber } from './util';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export const createUser = async (
  userId: string,
  nickname: string,
  include: IncludeUser = {},
) =>
  await prisma.user.create({
    data: {
      id: userId,
      stats: { create: {} },
      card: {
        create: {
          number: generateCardNumber(),
          date: generateCardDate(),
          initials: nickname,
        },
      },
      schedule: {
        create: {},
      },
    },
    include,
  });

export const getCreateUser = async (
  userId: string,
  nickname: string,
  include: IncludeUser = {},
) =>
  (await prisma.user.findUnique({
    where: { id: userId },
    include,
  })) ?? (await createUser(userId, nickname, include));

export { prisma };
