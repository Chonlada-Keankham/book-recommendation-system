// reply.interface.ts
import { Types } from 'mongoose';

export interface iReply {
  _id?: Types.ObjectId;
  userId: Types.ObjectId | { _id: Types.ObjectId; username: string };
  likedBy?: Types.ObjectId[]; // array of userIds who liked this reply
  content: string;
  created_at: Date;
  updated_at?: Date;
}
