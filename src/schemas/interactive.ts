import z from 'zod';

export const WorksRecordSchema = z.record(
  z.string(),
  z.object({
    name: z.string(),
    salary: z.number(),
    minReputation: z.number(),
  }),
);

export type WorksRecord = z.infer<typeof WorksRecordSchema>;
