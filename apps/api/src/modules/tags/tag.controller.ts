import type { RequestHandler } from 'express';
import type { CreateTagInput } from '@note-manager/shared';
import * as service from './tag.service.js';

export const list: RequestHandler = async (req, res) => {
  const docs = await service.listTags(req.userId!);
  res.json({ tags: docs.map((d) => d.toJSON()) });
};

export const create: RequestHandler = async (req, res) => {
  const doc = await service.createTag(req.userId!, req.validated.body as CreateTagInput);
  res.status(201).json({ tag: doc.toJSON() });
};

export const remove: RequestHandler = async (req, res) => {
  const { id } = req.validated.params as { id: string };
  await service.deleteTag(req.userId!, id);
  res.status(204).end();
};
