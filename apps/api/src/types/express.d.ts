import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth once a valid session token is verified. */
      userId?: string;
      /** Parsed, schema-validated request data set by the validate() middleware. */
      validated: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
