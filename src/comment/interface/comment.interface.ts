import { Types } from 'mongoose';

export interface iComment {
  _id?: Types.ObjectId;
  book: Types.ObjectId;
  status: 'active' | 'deleted';
  deleted_at?: Date | null;
  users: {
    user: Types.ObjectId;
    comments: {
      _id?: Types.ObjectId;
      content: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: Date | null;
      replies: {
        _id?: Types.ObjectId;
        user: Types.ObjectId;
        content: string;
        created_at: Date;
        updated_at: Date;
        deleted_at?: Date | null;
      }[];
    }[];
  }[];
}
