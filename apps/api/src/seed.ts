/**
 * Seed the database with a demo user and synthetic notes.
 *
 * Deliberately uses made-up sample content (NOT the author's real work notes),
 * so the repository stays safe to publish. Override the demo credentials with
 * SEED_EMAIL / SEED_PASSWORD env vars.
 *
 * Run: npm run seed --workspace @note-manager/api
 */
import { connectDb, disconnectDb } from './db/connect.js';
import { env } from './config/env.js';
import { User, type UserDoc } from './models/user.model.js';
import { NoteType } from './models/note-type.model.js';
import { Note } from './models/note.model.js';
import { hashPassword } from './lib/password.js';
import { logger } from './lib/logger.js';
import type { HydratedDocument } from 'mongoose';

const SEED_EMAIL = process.env.SEED_EMAIL ?? 'demo@example.com';
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'password123';

const NOTE_TYPE_NAMES = ['Standup', 'Bug', 'Feature', 'Meeting', 'Personal'] as const;

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const SAMPLE_NOTES: Array<{
  type: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
}> = [
  {
    type: 'Standup',
    title: 'Daily standup',
    content:
      '**Yesterday:** wired up the notes API.\n**Today:** add search + filtering.\n**Blockers:** none.',
    tags: ['daily'],
    date: daysAgo(0),
  },
  {
    type: 'Standup',
    title: 'Daily standup',
    content:
      '**Yesterday:** scaffolded the monorepo.\n**Today:** Mongoose models + auth.\n**Blockers:** none.',
    tags: ['daily'],
    date: daysAgo(1),
  },
  {
    type: 'Bug',
    title: 'Fix note list sort order',
    content: 'Notes were not sorting by most-recently-updated. Added a compound index and sort.',
    tags: ['backend'],
    date: daysAgo(1),
  },
  {
    type: 'Feature',
    title: 'Break calculator',
    content: 'Compute expected return time from a break (default 1h30m), with 24h wrap.',
    tags: ['frontend', 'ux'],
    date: daysAgo(2),
  },
  {
    type: 'Meeting',
    title: 'Sprint planning',
    content: 'Agreed to build auth first, then notes CRUD, then the React UI.',
    tags: ['planning'],
    date: daysAgo(3),
  },
  {
    type: 'Personal',
    title: 'Learning note',
    content: 'Express 5 forwards rejected promises to the error handler automatically.',
    tags: ['til'],
    date: daysAgo(4),
  },
];

async function run() {
  await connectDb(env.MONGODB_URI);

  let user: HydratedDocument<UserDoc> | null = await User.findOne({ email: SEED_EMAIL });
  if (!user) {
    user = await User.create({
      email: SEED_EMAIL,
      passwordHash: await hashPassword(SEED_PASSWORD),
      name: 'Demo User',
    });
  }

  // Reset this demo user's data so the seed is idempotent.
  await Note.deleteMany({ userId: user._id });
  await NoteType.deleteMany({ userId: user._id });

  const typeDocs = await NoteType.insertMany(
    NOTE_TYPE_NAMES.map((name) => ({ userId: user._id, name })),
  );
  const typeIdByName = new Map(typeDocs.map((t) => [String(t.name), t._id]));

  const noteDocs = SAMPLE_NOTES.map((n) => ({
    userId: user._id,
    noteTypeId: typeIdByName.get(n.type),
    title: n.title,
    content: n.content,
    date: n.date,
    tags: n.tags,
  }));
  await Note.insertMany(noteDocs);

  logger.info(
    `Seeded ${noteDocs.length} notes across ${typeDocs.length} note types for ${SEED_EMAIL}`,
  );
  await disconnectDb();
}

run().catch((err) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
