import { z } from 'zod';
import { objectIdSchema } from './common.js';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  // Optional: an empty or whitespace-only value (e.g. an untouched form field,
  // which arrives as '') is treated as "not provided" rather than failing min(1).
  name: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().min(1).max(100).optional(),
  ),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
});

/** Public, safe-to-return representation of a user (never includes the password hash). */
export const publicUserSchema = z.object({
  id: objectIdSchema,
  email: z.string().email(),
  name: z.string().optional(),
  createdAt: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
