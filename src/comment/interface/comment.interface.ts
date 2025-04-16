// comment.interface.ts
import { Types } from 'mongoose';
import { iReply } from './reply.interface';

export interface iComment {
  _id?: Types.ObjectId;
  user: Types.ObjectId | { _id: Types.ObjectId; username: string };
  book: Types.ObjectId;
  content: string;
  replies: iReply[];
  created_at?: Date;
  updated_at?: Date;
}
