import { Types } from "mongoose";

export interface iReply {
    _id?: string;
    userId: Types.ObjectId; 
    content: string;
    created_at: Date;
    updated_at?: Date;
  }
  