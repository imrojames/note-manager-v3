import type { CreateNoteTypeInput, UpdateNoteTypeInput } from '@note-manager/shared';
import { NoteType } from '../../models/note-type.model.js';
import { Note } from '../../models/note.model.js';
import { ConflictError, NotFoundError } from '../../lib/errors.js';

export function listNoteTypes(userId: string) {
  return NoteType.find({ userId }).sort({ name: 1 });
}

export function createNoteType(userId: string, input: CreateNoteTypeInput) {
  return NoteType.create({ userId, name: input.name });
}

export async function getNoteType(userId: string, id: string) {
  const doc = await NoteType.findOne({ _id: id, userId });
  if (!doc) throw new NotFoundError('Note type not found');
  return doc;
}

export async function updateNoteType(userId: string, id: string, input: UpdateNoteTypeInput) {
  const doc = await NoteType.findOneAndUpdate({ _id: id, userId }, input, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new NotFoundError('Note type not found');
  return doc;
}

export async function deleteNoteType(userId: string, id: string) {
  const inUse = await Note.countDocuments({ userId, noteTypeId: id });
  if (inUse > 0) {
    throw new ConflictError(`Cannot delete: ${inUse} note(s) still use this type`);
  }
  const doc = await NoteType.findOneAndDelete({ _id: id, userId });
  if (!doc) throw new NotFoundError('Note type not found');
}
