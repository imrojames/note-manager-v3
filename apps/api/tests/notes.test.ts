import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();
type Agent = ReturnType<typeof request.agent>;

async function authedAgent(email = 'user@b.com') {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ email, password: 'password123' });
  return agent;
}

async function createType(agent: Agent, name = 'Standup'): Promise<string> {
  const res = await agent.post('/api/note-types').send({ name });
  return res.body.noteType.id as string;
}

describe('notes', () => {
  let agent: Agent;
  let noteTypeId: string;

  beforeEach(async () => {
    agent = await authedAgent();
    noteTypeId = await createType(agent);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.status).toBe(401);
  });

  it('creates a note with a default date and empty tags', async () => {
    const res = await agent
      .post('/api/notes')
      .send({ title: 'First note', content: 'Hello world', noteTypeId });

    expect(res.status).toBe(201);
    expect(res.body.note).toMatchObject({
      title: 'First note',
      content: 'Hello world',
      noteTypeId,
    });
    expect(res.body.note.id).toBeDefined();
    expect(res.body.note.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(res.body.note.tags).toEqual([]);
  });

  it('rejects a note referencing a note type the user does not own', async () => {
    const other = await authedAgent('other@b.com');
    const otherTypeId = await createType(other, 'Private');

    const res = await agent
      .post('/api/notes')
      .send({ title: 'Nope', content: 'x', noteTypeId: otherTypeId });
    expect(res.status).toBe(400);
  });

  it('lists notes newest-first and filters by note type', async () => {
    const featureId = await createType(agent, 'Feature');
    await agent.post('/api/notes').send({ title: 'Old', content: 'a', noteTypeId });
    await agent.post('/api/notes').send({ title: 'New', content: 'b', noteTypeId: featureId });

    const all = await agent.get('/api/notes');
    expect(all.status).toBe(200);
    expect(all.body.notes).toHaveLength(2);
    expect(all.body.notes[0].title).toBe('New'); // most recently created first

    const filtered = await agent.get(`/api/notes?noteTypeId=${featureId}`);
    expect(filtered.body.notes).toHaveLength(1);
    expect(filtered.body.notes[0].title).toBe('New');
  });

  it('full-text searches note title and content', async () => {
    await agent
      .post('/api/notes')
      .send({ title: 'Database indexing', content: 'mongo text', noteTypeId });
    await agent.post('/api/notes').send({ title: 'Lunch plans', content: 'tacos', noteTypeId });

    const res = await agent.get('/api/notes?q=mongo');
    expect(res.status).toBe(200);
    expect(res.body.notes).toHaveLength(1);
    expect(res.body.notes[0].title).toBe('Database indexing');
  });

  it('gets, updates, and deletes a note', async () => {
    const created = await agent
      .post('/api/notes')
      .send({ title: 'Editable', content: 'v1', noteTypeId });
    const id = created.body.note.id as string;

    const got = await agent.get(`/api/notes/${id}`);
    expect(got.status).toBe(200);
    expect(got.body.note.content).toBe('v1');

    const updated = await agent.patch(`/api/notes/${id}`).send({ content: 'v2' });
    expect(updated.status).toBe(200);
    expect(updated.body.note.content).toBe('v2');

    const deleted = await agent.delete(`/api/notes/${id}`);
    expect(deleted.status).toBe(204);

    const gone = await agent.get(`/api/notes/${id}`);
    expect(gone.status).toBe(404);
  });

  it("does not expose another user's note", async () => {
    const created = await agent
      .post('/api/notes')
      .send({ title: 'Mine', content: 'secret', noteTypeId });
    const id = created.body.note.id as string;

    const intruder = await authedAgent('intruder@b.com');
    const res = await intruder.get(`/api/notes/${id}`);
    expect(res.status).toBe(404);
  });

  it('rejects an invalid note id with a validation error', async () => {
    const res = await agent.get('/api/notes/not-a-valid-id');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
