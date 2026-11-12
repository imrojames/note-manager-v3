import type { CreateTagInput } from '@note-manager/shared';
import { Tag } from '../../models/tag.model.js';
import { NotFoundError } from '../../lib/errors.js';

export function listTags(userId: string) {
  return Tag.find({ userId }).sort({ name: 1 });
}

export function createTag(userId: string, input: CreateTagInput) {
  return Tag.create({ userId, name: input.name });
}

export async function deleteTag(userId: string, id: string) {
  const doc = await Tag.findOneAndDelete({ _id: id, userId });
  if (!doc) throw new NotFoundError('Tag not found');
}
