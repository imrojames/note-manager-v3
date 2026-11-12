import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();
type Agent = ReturnType<typeof request.agent>;

async function authedAgent(email = 'types@b.com') {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ email, password: 'password123' });
  return agent;
}

describe('note types', () => {
  let agent: Agent;

  beforeEach(async () => {
    agent = await authedAgent();
  });

  it('creates and lists note types alphabetically', async () => {
    await agent.post('/api/note-types').send({ name: 'Standup' });
    await agent.post('/api/note-types').send({ name: 'Bug' });

    const res = await agent.get('/api/note-types');
    expect(res.status).toBe(200);
    expect(res.body.noteTypes.map((t: { name: string }) => t.name)).toEqual(['Bug', 'Standup']);
  });

  it('rejects a duplicate note-type name with 409', async () => {
    await agent.post('/api/note-types').send({ name: 'Meeting' });
    const res = await agent.post('/api/note-types').send({ name: 'Meeting' });
    expect(res.status).toBe(409);
  });

  it('updates a note type', async () => {
    const created = await agent.post('/api/note-types').send({ name: 'Draft' });
    const id = created.body.noteType.id as string;

    const res = await agent.patch(`/api/note-types/${id}`).send({ name: 'Final' });
    expect(res.status).toBe(200);
    expect(res.body.noteType.name).toBe('Final');
  });

  it('blocks deleting a note type that is still in use', async () => {
    const created = await agent.post('/api/note-types').send({ name: 'InUse' });
    const id = created.body.noteType.id as string;
    await agent.post('/api/notes').send({ title: 'x', content: 'y', noteTypeId: id });

    const res = await agent.delete(`/api/note-types/${id}`);
    expect(res.status).toBe(409);
  });

  it('deletes an unused note type', async () => {
    const created = await agent.post('/api/note-types').send({ name: 'Unused' });
    const id = created.body.noteType.id as string;

    const res = await agent.delete(`/api/note-types/${id}`);
    expect(res.status).toBe(204);
  });
});
