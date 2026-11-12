import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '../lib/errors.js';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validate request body/query/params against Zod schemas.
 * Parsed output is attached to `req.validated` (Express 5 makes req.query
 * read-only, so controllers read the validated data from there).
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    req.validated ??= {};
    for (const key of ['body', 'query', 'params'] as const) {
      const schema = schemas[key];
      if (!schema) continue;
      const result = schema.safeParse(req[key]);
      if (!result.success) {
        next(new ValidationError(result.error));
        return;
      }
      req.validated[key] = result.data;
    }
    next();
  };
}
