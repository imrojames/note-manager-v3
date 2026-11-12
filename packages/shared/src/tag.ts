import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const tagSchema = z.object({
  id: objectIdSchema,
  name: z.string().min(1).max(50),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createTagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50),
});

export type Tag = z.infer<typeof tagSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
