import { afterAll, afterEach, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Make sure env validation has what it needs before app modules load.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'test-secret';

import { User } from '../src/models/user.model.js';
import { NoteType } from '../src/models/note-type.model.js';
import { Note } from '../src/models/note.model.js';
import { Tag } from '../src/models/tag.model.js';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // Build indexes (unique constraints + the notes text index) before tests run.
  await Promise.all([User.init(), NoteType.init(), Note.init(), Tag.init()]);
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
