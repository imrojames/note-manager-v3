/**
 * Seed the configured MongoDB (MONGODB_URI) with demo data.
 * Run: npm run seed --workspace @note-manager/api
 */
import { connectDb, disconnectDb } from './db/connect.js';
import { env } from './config/env.js';
import { seedDatabase } from './lib/seed.js';
import { logger } from './lib/logger.js';

async function run() {
  await connectDb(env.MONGODB_URI);
  await seedDatabase();
  await disconnectDb();
}

run().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
