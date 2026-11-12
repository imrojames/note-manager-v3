import { createApp } from './app.js';
import { connectDb } from './db/connect.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

async function main() {
  await connectDb(env.MONGODB_URI);
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  logger.error({ err }, 'Failed to start API');
  process.exit(1);
});
