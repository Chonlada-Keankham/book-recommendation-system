import { Types } from "mongoose";
import { iReply } from "./reply.interface";

export interface iComment {
  _id?: string;
  bookId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  replies: iReply[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;

 
}