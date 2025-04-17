import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // ใช้ timestamps เพื่อให้มี createdAt, updatedAt อัตโนมัติ
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: [
      {
        _id: { type: Types.ObjectId, auto: true },
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date },
      },
    ],
    default: [],
  })
  replies: {
    _id?: Types.ObjectId;
    userId: Types.ObjectId | { _id: Types.ObjectId; username: string };
    content: string;
    created_at: Date;
    updated_at?: Date;
  }[];
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
