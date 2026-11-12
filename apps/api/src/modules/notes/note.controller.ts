import type { RequestHandler } from 'express';
import type { CreateNoteInput, UpdateNoteInput, ListNotesQuery } from '@note-manager/shared';
import * as service from './note.service.js';

export const list: RequestHandler = async (req, res) => {
  const docs = await service.listNotes(req.userId!, req.validated.query as ListNotesQuery);
  res.json({ notes: docs.map((d) => d.toJSON()) });
};

export const create: RequestHandler = async (req, res) => {
  const doc = await service.createNote(req.userId!, req.validated.body as CreateNoteInput);
  res.status(201).json({ note: doc.toJSON() });
};

export const getOne: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  const doc = await service.getNote(req.userId!, id);
  res.json({ note: doc.toJSON() });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  const doc = await service.updateNote(req.userId!, id, req.validated.body as UpdateNoteInput);
  res.json({ note: doc.toJSON() });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  await service.deleteNote(req.userId!, id);
  res.status(204).end();
};
