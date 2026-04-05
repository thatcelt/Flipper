import z from 'zod';

export const IncludeUserSchema = z.object({
  stats: z.boolean().optional(),
  card: z.boolean().optional(),
  schedule: z.boolean().optional(),
  couple: z.boolean().optional(),
});

export type IncludeUser = z.infer<typeof IncludeUserSchema>;
