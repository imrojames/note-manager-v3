import { Schema, model, type Types } from 'mongoose';

export interface NoteTypeDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteTypeSchema = new Schema<NoteTypeDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.userId;
        return ret;
      },
    },
  },
);

// A user cannot have two note types with the same name.
noteTypeSchema.index({ userId: 1, name: 1 }, { unique: true });

export const NoteType = model<NoteTypeDoc>('NoteType', noteTypeSchema);
