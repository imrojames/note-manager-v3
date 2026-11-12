import type { FilterQuery } from 'mongoose';
import type { CreateNoteInput, UpdateNoteInput, ListNotesQuery } from '@note-manager/shared';
import { Note, type NoteDoc } from '../../models/note.model.js';
import { NoteType } from '../../models/note-type.model.js';
import { BadRequestError, NotFoundError } from '../../lib/errors.js';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Ensure the given note type exists AND belongs to this user. */
async function assertNoteTypeOwned(userId: string, noteTypeId: string): Promise<void> {
  const owned = await NoteType.exists({ _id: noteTypeId, userId });
  if (!owned) {
    throw new BadRequestError('noteTypeId does not reference one of your note types');
  }
}

export function listNotes(userId: string, query: ListNotesQuery) {
  const filter: FilterQuery<NoteDoc> = { userId };
  if (query.noteTypeId) filter.noteTypeId = query.noteTypeId;
  if (query.tag) filter.tags = query.tag;
  if (query.date) filter.date = query.date;
  if (query.q) filter.$text = { $search: query.q };

  // Most recently touched first (replaces v2's client-side sortNotesByRecency).
  return Note.find(filter).sort({ updatedAt: -1, createdAt: -1 });
}

export async function getNote(userId: string, id: string) {
  const doc = await Note.findOne({ _id: id, userId });
  if (!doc) throw new NotFoundError('Note not found');
  return doc;
}

export async function createNote(userId: string, input: CreateNoteInput) {
  await assertNoteTypeOwned(userId, input.noteTypeId);
  return Note.create({
    userId,
    noteTypeId: input.noteTypeId,
    title: input.title,
    content: input.content,
    date: input.date ?? todayIso(),
    tags: input.tags ?? [],
  });
}

export async function updateNote(userId: string, id: string, input: UpdateNoteInput) {
  if (input.noteTypeId) await assertNoteTypeOwned(userId, input.noteTypeId);
  const doc = await Note.findOneAndUpdate({ _id: id, userId }, input, {
    new: true,
    runValidators: true,
  });
  if (!doc) throw new NotFoundError('Note not found');
  return doc;
}

export async function deleteNote(userId: string, id: string) {
  const doc = await Note.findOneAndDelete({ _id: id, userId });
  if (!doc) throw new NotFoundError('Note not found');
}
