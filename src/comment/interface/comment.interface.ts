import { Types } from 'mongoose';

export interface iComment {
  book: Types.ObjectId;  
  status: string;
  deleted_at?: Date; 
  users: {
    user: Types.ObjectId;  
    comments: {
      content: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: Date; 
    }[]; 
  }[]; 
}
