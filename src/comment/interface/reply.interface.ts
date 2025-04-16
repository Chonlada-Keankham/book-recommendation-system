import { Types } from "mongoose";

export interface iReply {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  created_at: Date;
  updated_at?: Date;
}