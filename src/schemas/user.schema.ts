import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
