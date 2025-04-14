import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Status } from 'src/enum/status.enum';
import { BookCategory } from 'src/enum/book-category.enum'; 

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
    book: MongooseSchema.Types.ObjectId;  

    @Prop({ type: String })
    book_th: string;  

    @Prop({ type: String })
    book_en: string;  

    @Prop({ type: String })
    img: string; 

    @Prop({ type: String, enum: BookCategory })
    category: BookCategory;  

    @Prop({ enum: Status, default: Status.ACTIVE })
    status: Status; 

    @Prop()
    isRead: boolean;  
    @Prop()
    notifyTime: Date;  

    @Prop({ default: Date.now })
    createdAt: Date; 
}

export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
