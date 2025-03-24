import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose'; 
import { Status } from 'src/enum/status.enum';

@Schema({ timestamps: true })
export class Comment {
  
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Book', required: true })
  book: MongooseSchema.Types.ObjectId;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;

  @Prop()
  deleted_at: Date;

  @Prop({
    type: [
      {
        user: { type: MongooseSchema.Types.ObjectId, ref: 'User', required: true },
        comments: [
          {
            content: { type: String, required: true },
            created_at: { type: Date, default: Date.now },
            updated_at: { type: Date, default: Date.now },
            deleted_at: Date,
          }
        ],
      }
    ]
  })
  users: { 
    user: MongooseSchema.Types.ObjectId;
    comments: { 
      content: string;
      created_at: Date;
      updated_at: Date;
      deleted_at?: Date;
    }[];
  }[];
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
