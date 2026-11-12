import type { RequestHandler } from 'express';
import type { CreateNoteTypeInput, UpdateNoteTypeInput } from '@note-manager/shared';
import * as service from './note-type.service.js';

export const list: RequestHandler = async (req, res) => {
  const docs = await service.listNoteTypes(req.userId!);
  res.json({ noteTypes: docs.map((d) => d.toJSON()) });
};

export const create: RequestHandler = async (req, res) => {
  const doc = await service.createNoteType(req.userId!, req.validated.body as CreateNoteTypeInput);
  res.status(201).json({ noteType: doc.toJSON() });
};

export const getOne: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  const doc = await service.getNoteType(req.userId!, id);
  res.json({ noteType: doc.toJSON() });
};

export const update: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  const doc = await service.updateNoteType(
    req.userId!,
    id,
    req.validated.body as UpdateNoteTypeInput,
  );
  res.json({ noteType: doc.toJSON() });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  await service.deleteNoteType(req.userId!, id);
  res.status(204).end();
};
