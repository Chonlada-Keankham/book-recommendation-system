// comment.interface.ts
import { Types } from 'mongoose';
import { iReply } from './reply.interface';

export interface iComment {
  _id?: Types.ObjectId;
  userId: Types.ObjectId | { _id: Types.ObjectId; username: string };
  bookId: Types.ObjectId;
  content: string;
  replies: iReply[];
  likedBy?: Types.ObjectId[]; // array of userIds who liked this comment
  created_at?: Date;
  updated_at?: Date;
}
