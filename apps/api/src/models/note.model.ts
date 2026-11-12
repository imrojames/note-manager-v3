import { Schema, model, type Types } from 'mongoose';

export interface NoteDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  noteTypeId: Types.ObjectId;
  title: string;
  content: string;
  date: string; // ISO calendar date, YYYY-MM-DD
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<NoteDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    noteTypeId: { type: Schema.Types.ObjectId, ref: 'NoteType', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    date: { type: String, required: true },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        ret.noteTypeId = String(ret.noteTypeId);
        delete ret._id;
        delete ret.__v;
        delete ret.userId;
        return ret;
      },
    },
  },
);

noteSchema.index({ userId: 1, noteTypeId: 1 });
noteSchema.index({ userId: 1, date: -1 });
// Full-text search across title + content.
noteSchema.index({ title: 'text', content: 'text' });

export const Note = model<NoteDoc>('Note', noteSchema);
