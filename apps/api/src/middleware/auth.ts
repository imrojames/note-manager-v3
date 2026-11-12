import type { Request, RequestHandler } from 'express';
import { AUTH_COOKIE, verifyToken } from '../lib/jwt.js';
import { UnauthorizedError } from '../lib/errors.js';

function extractToken(req: Request): string | undefined {
  const cookieToken = (req.cookies as Record<string, string> | undefined)?.[AUTH_COOKIE];
  if (cookieToken) return cookieToken;

  // Bearer token fallback is handy for REST-client / CI testing.
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

  return undefined;
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    next(new UnauthorizedError());
    return;
  }
  try {
    const { sub } = verifyToken(token);
    req.userId = sub;
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
