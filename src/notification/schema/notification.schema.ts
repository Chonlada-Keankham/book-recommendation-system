import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from 'src/enum/notification-type.enum';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps : true})
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: false })
  bookId?: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  isRead: boolean;
  
  @Prop({ default: Date.now })
  created_at: Date;
  
  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  })
  type: NotificationType;
  @Prop({ type: Types.ObjectId, ref: 'Comment', required: false })
  commentId?: Types.ObjectId;  // corrected field name

  @Prop({ type: String, required: true })
  link: string;               // link to navigate

}


export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1 });