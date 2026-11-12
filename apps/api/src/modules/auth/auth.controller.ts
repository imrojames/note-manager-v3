import type { RequestHandler, Response } from 'express';
import type { RegisterInput, LoginInput } from '@note-manager/shared';
import { registerUser, authenticateUser } from './auth.service.js';
import { signToken, AUTH_COOKIE } from '../../lib/jwt.js';
import { env } from '../../config/env.js';
import { User } from '../../models/user.model.js';
import { UnauthorizedError } from '../../lib/errors.js';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookie(res: Response, userId: string): void {
  res.cookie(AUTH_COOKIE, signToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.COOKIE_SECURE,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export const register: RequestHandler = async (req, res) => {
  const user = await registerUser(req.validated.body as RegisterInput);
  setAuthCookie(res, user.id);
  res.status(201).json({ user: user.toJSON() });
};

export const login: RequestHandler = async (req, res) => {
  const user = await authenticateUser(req.validated.body as LoginInput);
  setAuthCookie(res, user.id);
  res.status(200).json({ user: user.toJSON() });
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.status(204).end();
};

export const me: RequestHandler = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new UnauthorizedError();
  res.json({ user: user.toJSON() });
};
