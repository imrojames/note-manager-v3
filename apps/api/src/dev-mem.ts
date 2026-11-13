/**
 * Development server backed by an ephemeral in-memory MongoDB — zero database
 * setup, no Docker. Data resets on restart. Great for a quick look or e2e tests.
 *
 * Run: npm run dev:mem --workspace @note-manager/api
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

// Point the app at the in-memory instance BEFORE anything reads env/config.
const mongod = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongod.getUri();
process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

const [{ createApp }, { connectDb }, { seedDatabase }, { env }, { logger }] = await Promise.all([
  import('./app.js'),
  import('./db/connect.js'),
  import('./lib/seed.js'),
  import('./config/env.js'),
  import('./lib/logger.js'),
]);

await connectDb(env.MONGODB_URI);
await seedDatabase();

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(
    `[dev:mem] API on http://localhost:${env.PORT} — in-memory MongoDB, login demo@example.com / password123`,
  );
});

async function shutdown() {
  server.close();
  await mongod.stop();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
