import { Schema, Types } from 'mongoose';

export const CommentSchema = new Schema({
  book: { type: Types.ObjectId, ref: 'Book', required: true },
  users: [
    {
      user: { type: Types.ObjectId, ref: 'User', required: true },
      comments: [
        {
          content: { type: String, required: true },
          created_at: { type: Date, default: Date.now },
          updated_at: { type: Date, default: Date.now },
        },
      ],
    },
  ],
  deleted_at: { type: Date, default: null },
}, { timestamps: true });