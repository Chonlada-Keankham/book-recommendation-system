import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/enum/status.enum';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId; 

  @Prop({ type: String, required: true })
  username: string; 

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId; 
  @Prop({ type: String, required: true })
  content: string; 

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status; 

  @Prop({ type: Date, default: null })
  deleted_at?: Date; 
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
