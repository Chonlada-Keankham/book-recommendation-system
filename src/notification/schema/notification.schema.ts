import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Status } from 'src/enum/status.enum';
import { BookCategory } from 'src/enum/book-category.enum';  // นำเข้า enum สำหรับหมวดหมู่

@Schema({ timestamps: true })
export class Notification {

    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        required: true
    })
    user: MongooseSchema.Types.ObjectId;

    @Prop({
         type: MongooseSchema.Types.ObjectId,
         ref: 'Book', required: true })
    book: MongooseSchema.Types.ObjectId;  // เก็บ ObjectId ของหนังสือที่มีการแจ้งเตือน (เชื่อมโยงกับ Book Schema)

    @Prop({ type: String })
    book_th: string;  // ชื่อหนังสือภาษาไทย (จาก Book Schema)

    @Prop({ type: String })
    book_en: string;  // ชื่อหนังสือภาษาอังกฤษ (จาก Book Schema)

    @Prop({ type: String })
    img: string;  // รูปปกของหนังสือ (จาก Book Schema)

    @Prop({ type: String, enum: BookCategory })
    category: BookCategory;  // หมวดหมู่ของหนังสือ (ใช้ enum จาก BookCategory)

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status;  // สถานะการแจ้งเตือน

    @Prop()
    isRead: boolean;  // สถานะการอ่าน (อ่านหรือยัง)

    @Prop()
    notifyTime: Date;  // เวลาในการแจ้งเตือน

    @Prop({ default: Date.now })
    createdAt: Date;  // เวลาที่การแจ้งเตือนถูกสร้าง
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
