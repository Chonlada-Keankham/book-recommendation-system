import { Types } from "mongoose";

export interface iComment {
  _id?: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;

  replies: {
    _id?: string;
    user_id: string;
    content: string;
    created_at: Date;
    updated_at?: Date;
  }[];

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
