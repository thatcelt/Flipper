import z from 'zod';

export const SubCommandsEnum = z.enum(['profile', 'eco']);

export const ErrorsEnum = z.enum([
  'UNKNOWN_CATEGORY',
  'NOT_ENOUGH_MONEY',
  'NOT_ENOUGH_REPUTATION',
  'NO_WORK',
  'GET_FIRED',
  'WORK_NOT_FOUND',
  'ALREADY_WORKING',
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
