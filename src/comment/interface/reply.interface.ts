// reply.interface.ts
import { Types } from 'mongoose';

export interface iReply {
  _id?: Types.ObjectId;
  userId: Types.ObjectId | { _id: Types.ObjectId; username: string };
  content: string;
  likedBy?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;}
