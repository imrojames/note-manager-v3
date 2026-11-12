import { pino } from 'pino';
import { env } from '../config/env.js';

const level = env.LOG_LEVEL ?? (env.NODE_ENV === 'test' ? 'silent' : 'info');

export const logger = pino({
  level,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
      : undefined,
});
