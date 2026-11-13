/**
 * Seed logic shared by the `seed` script and the in-memory dev server.
 * Assumes an active Mongoose connection. Idempotent for the demo user.
 *
 * Uses synthetic sample content (NOT real work notes), so it is safe to ship.
 * Override the demo credentials with SEED_EMAIL / SEED_PASSWORD.
 */
import { User } from '../models/user.model.js';
import { NoteType } from '../models/note-type.model.js';
import { Note } from '../models/note.model.js';
import { hashPassword } from './password.js';
import { logger } from './logger.js';

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

export interface SeedResult {
  email: string;
  noteTypes: number;
  notes: number;
}

export async function seedDatabase(): Promise<SeedResult> {
  let user = await User.findOne({ email: SEED_EMAIL });
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

  return { email: SEED_EMAIL, noteTypes: typeDocs.length, notes: noteDocs.length };
}
