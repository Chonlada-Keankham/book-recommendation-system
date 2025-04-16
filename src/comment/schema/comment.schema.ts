import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema() 
export class Reply {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  updated_at?: Date;
}
export const ReplySchema = SchemaFactory.createForClass(Reply);

@Schema({ timestamps: true }) 
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [ReplySchema], default: [] })
  replies: Reply[];

  @Prop()
  deleted_at?: Date;
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
