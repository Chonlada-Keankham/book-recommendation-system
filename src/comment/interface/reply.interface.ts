import { Types } from "mongoose";

export interface iReply {
  likes: any;
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | { _id: Types.ObjectId; username: string };
  content: string;
  likedBy?: Types.ObjectId[];
  likeCount?: number;
  likedByMe?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
