import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const noteTypeSchema = z.object({
  id: objectIdSchema,
  name: z.string().min(1).max(100),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createNoteTypeSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
});

export const updateNoteTypeSchema = createNoteTypeSchema.partial();

export type NoteType = z.infer<typeof noteTypeSchema>;
export type CreateNoteTypeInput = z.infer<typeof createNoteTypeSchema>;
export type UpdateNoteTypeInput = z.infer<typeof updateNoteTypeSchema>;
