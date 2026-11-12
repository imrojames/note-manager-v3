import { z } from 'zod';
import { objectIdSchema } from '@note-manager/shared';

/** Reusable `:id` route-param schema. */
export const idParamsSchema = z.object({ id: objectIdSchema });
