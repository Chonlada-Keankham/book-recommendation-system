// src/notification/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType } from 'src/enum/notification-type.enum';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'Book' })
  bookId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Comment' })
  commentId?: Types.ObjectId;      // ← เปลี่ยนชื่อที่นี่

  @Prop({ type: String, required: true })
  link: string;                    // ← เพิ่มลิงก์ตรงนี้

  @Prop({ type: Boolean, default: false })
  isRead: boolean;

  @Prop({
    type: String,
    enum: Object.values(NotificationType),
    required: true,
  })
  type: NotificationType;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, isRead: 1 });
