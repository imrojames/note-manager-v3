import type { RegisterInput, LoginInput } from '@note-manager/shared';
import { User } from '../../models/user.model.js';
import { hashPassword, comparePassword } from '../../lib/password.js';
import { ConflictError, UnauthorizedError } from '../../lib/errors.js';

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ConflictError('An account with that email already exists');

  const passwordHash = await hashPassword(input.password);
  return User.create({ email: input.email, passwordHash, name: input.name });
}

export async function authenticateUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email });
  // Same error whether the email or password is wrong (avoid user enumeration).
  if (!user) throw new UnauthorizedError('Invalid email or password');

  const ok = await comparePassword(input.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError('Invalid email or password');

  return user;
}
