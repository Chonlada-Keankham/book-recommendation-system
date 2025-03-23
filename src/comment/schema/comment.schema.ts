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
      }]
    }],
    required: true
  })
  users: {
    user: Types.ObjectId; 
    comments: {
      content: string; 
    }[];
  }[];

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status; 

  @Prop({ type: Date, default: null }) 
  deleted_at?: Date; 
}

export type CommentDocument = Comment & Document;

export const CommentSchema = SchemaFactory.createForClass(Comment);