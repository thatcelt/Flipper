import z from 'zod';

export const SubCommandsEnum = z.enum(['profile', 'eco']);

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
]);

export const WorksRecordSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    salary: z.number(),
    minReputation: z.number(),
  }),
);

export type WorksRecord = z.infer<typeof WorksRecordSchema>;

export const SubCommandsRecordSchema = z.record(SubCommandsEnum, z.string());

export type SubCommandsRecord = z.infer<typeof SubCommandsRecordSchema>;
export type SubCommand = z.infer<typeof SubCommandsEnum>;

export type ErrorsMap = z.infer<typeof ErrorsEnum>;
