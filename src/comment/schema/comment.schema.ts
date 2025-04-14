import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book: Types.ObjectId;

  @Prop({ type: String, enum: ['active', 'deleted'], default: 'active' })
  status: 'active' | 'deleted';

  @Prop({ type: Date, default: null })
  deleted_at: Date | null;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User' },
        comments: [
          {
            _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
            content: String,
            created_at: Date,
            updated_at: Date,
            deleted_at: { type: Date, default: null },
            replies: [
              {
                _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
                user: { type: Types.ObjectId, ref: 'User' },
                content: String,
                created_at: Date,
                updated_at: Date,
                deleted_at: { type: Date, default: null },
              },
            ],
          },
        ],
      },
    ],
  })
  users: any[];
}

export type CommentDocument = Comment & Document;
export const CommentSchema = SchemaFactory.createForClass(Comment);
