import { z } from 'zod';
import { objectIdSchema, isoDateSchema } from './common.js';

export const noteSchema = z.object({
  id: objectIdSchema,
  title: z.string().min(1).max(200),
  content: z.string(),
  noteTypeId: objectIdSchema,
  /** The work day this note belongs to (for standup/daily grouping). */
  date: isoDateSchema,
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  content: z.string().trim().min(1, 'Content is required'),
  noteTypeId: objectIdSchema,
  date: isoDateSchema.optional(),
  tags: z.array(z.string().trim().min(1)).max(50).optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

/** Query params for listing/filtering notes. */
export const listNotesQuerySchema = z.object({
  noteTypeId: objectIdSchema.optional(),
  q: z.string().trim().min(1).optional(),
  tag: z.string().trim().min(1).optional(),
  date: isoDateSchema.optional(),
});

export type Note = z.infer<typeof noteSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>;
