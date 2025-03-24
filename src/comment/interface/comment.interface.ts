import { Types } from 'mongoose';

export interface iComment {
  book: Types.ObjectId;
  status: string;
  deleted_at?: Date;
  users: {
    user: Types.ObjectId;
    comments: {
      _id: Types.ObjectId;  
      content: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: Date;
    }[];
  }[];
}
