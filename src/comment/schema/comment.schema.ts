import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Status } from 'src/enum/status.enum';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId; 

  @Prop({
    type: [{
      user: { type: Types.ObjectId, ref: 'User', required: true }, 
      comments: [{
        content: { type: String, required: true }, 
        created_at: { type: Date, default: Date.now }, 
      }]
    }],
    required: true
  })
  users: {
    user: Types.ObjectId; 
    comments: {
      content: string; 
      created_at: Date;
    }[];
  }[];

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status; 

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, default: Date.now })
  updated_at: Date;
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);