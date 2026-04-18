import z from 'zod';

export const SubCommandsEnum = z.enum(['profile', 'eco', 'inter']);

export const ReputationActionEnum = z.enum(['increase', 'decrease']);

export const ErrorsEnum = z.enum([
  'unknownCategory',
  'notEnoughMoney',
  'notEnoughReputation',
  'noWork',
  'getFired',
  'workNotFound',
  'alreadyWorking',
  'enterCorrectAmount',
  'minDeposit',
  'needToReply',
  'accessDenied',
  'userNotFound',
  'enterCorrectUser',
  'cantFight',
  'unknownPage',
  'productNotFound',
  'productAlreadyOwned',
  'enterCorrectProductId',
  'productNotOwned',
  'enterCorrectQuery',
  'youAlreadyMarried',
  'userAlreadyMarried',
  'userAlreadyRequested',
]);

export const BooleanEnum = z.enum(['true', 'false']);

export const WorksRecordSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    salary: z.number(),
    minReputation: z.number(),
  }),
);

export const SubCommandsRecordSchema = z.record(SubCommandsEnum, z.string());

export const ProductCategoryEnum = z.enum(['other', 'backgrounds', 'frames']);

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  thumbnail: z.string(),
  cost: z.number(),
});

export type WorksRecord = z.infer<typeof WorksRecordSchema>;
export type SubCommandsRecord = z.infer<typeof SubCommandsRecordSchema>;
export type SubCommand = z.infer<typeof SubCommandsEnum>;
export type ReputationAction = z.infer<typeof ReputationActionEnum>;
export type ErrorsMap = z.infer<typeof ErrorsEnum>;
export type BooleanValue = z.infer<typeof BooleanEnum>;
export type ProductCategory = z.infer<typeof ProductCategoryEnum>;
export type Product = z.infer<typeof ProductSchema>;
