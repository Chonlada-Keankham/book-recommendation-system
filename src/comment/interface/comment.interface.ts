import { Document, Types } from 'mongoose';

export interface iComment extends Document {
  book: Types.ObjectId;
  users: Array<{
    user: Types.ObjectId;
    comments: Array<{
      _id: Types.ObjectId;
      content: string;
      created_at: Date;
      updated_at: Date;
    }>;
  }>;
  deleted_at: Date | null;
}
