import { Types } from 'mongoose';
import { iReply } from './reply.interface';

export interface iComment {
  _id?: Types.ObjectId | string;
  userId: Types.ObjectId | { _id: Types.ObjectId; username: string };
  bookId: Types.ObjectId | string;
  content: string;
  replies: iReply[];
  likedBy?: Types.ObjectId[];  // สำหรับภายในระบบ
  likeCount?: number;         // สำหรับแสดงจำนวนไลก์ (frontend ใช้)
  likedByMe?: boolean;        // สำหรับบอกว่า user นี้เคยไลก์หรือยัง
  createdAt?: Date;
  updatedAt?: Date;
}
