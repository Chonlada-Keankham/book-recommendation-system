import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Status } from 'src/enum/status.enum';

@Schema({ timestamps: true })
export class Comment {

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;

  @Prop()
  deleted_at: Date;

  @Prop([{
    user: { type: Types.ObjectId, ref: 'User', required: true },
    comments: [{
      content: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
      deleted_at: { type: Date },
      replies: [{
        user: { type: Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now },
        deleted_at: { type: Date },
      }]
    }]
  }])
  users: {
    user: Types.ObjectId;
    comments: {
      content: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: Date | null;
      replies: {
        user: Types.ObjectId;
        content: string;
        created_at: Date;
        updated_at: Date;
        deleted_at?: Date | null;
      }[];
    }[];
  }[];
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
