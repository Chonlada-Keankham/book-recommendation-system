import { ObjectId } from 'mongoose';

export interface iComment {
  book: ObjectId;
  status: string;
  deleted_at?: Date; 
  users: {
    user: ObjectId;
    comments: {
      content: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: Date; 
    }[];
  }[];
}
