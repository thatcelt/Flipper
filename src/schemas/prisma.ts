import z from 'zod';
import { Prisma } from '../../generated/prisma/client';

export const CardColumnEnum = z.enum(['cash', 'balance']);

export const IncludeUserSchema = z.object({
  stats: z.boolean().optional(),
  card: z.boolean().optional(),
  schedule: z.boolean().optional(),
  couple: z.boolean().optional(),
});

export type UserWithStats = Prisma.UserGetPayload<{ include: { stats: true } }>;
export type UserWithStatsCard = Prisma.UserGetPayload<{
  include: { stats: true; card: true };
}>;

export type IncludeUser = z.infer<typeof IncludeUserSchema>;
export type CardColumn = z.infer<typeof CardColumnEnum>;
