// reply.interface.ts
import { Types } from 'mongoose';

export interface iReply {
  _id?: Types.ObjectId;
  user: Types.ObjectId | { _id: Types.ObjectId; username: string };
  content: string;
  created_at: Date;
  updated_at?: Date;
}
