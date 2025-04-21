import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookCategory } from 'src/enum/book-category.enum';
import { Status } from 'src/enum/status.enum';

@Schema({ timestamps: true })
export class Book {
  @Prop({
    required: true,
    validate: {
      validator: (value: string) => /^[ก-๙0-9\s]+$/.test(value), 
      message: 'ชื่อหนังสือภาษาไทยต้องมีแต่ตัวอักษรไทยและตัวเลขเท่านั้น',
    },
  })
  book_th: string;

  @Prop({
    required: true,
    validate: {
      validator: (value: string) => /^[a-zA-Z0-9\s]+$/.test(value), 
      message: 'ชื่อหนังสือภาษาอังกฤษต้องมีแต่ตัวอักษรอังกฤษและตัวเลขเท่านั้น',
    },
  })
  book_en: string;

  @Prop({ required: false })
  img: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true, enum: BookCategory })
  category: BookCategory;

  @Prop({ required: true, default: 0 })
  view: number;

  @Prop({ enum: Status, default: Status.ACTIVE })
  status: Status;

  @Prop({ type: Date, default: null })
  deleted_at?: Date;
  
  @Prop({
    required: false,
    max_length: 500, 
  })
  short_description: string;

  @Prop({ required: false })
img_public_id: string; 
}


export type BookDocument = Book & Document;

export const BookSchema = SchemaFactory.createForClass(Book);
