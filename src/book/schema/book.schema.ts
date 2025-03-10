import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BookCategory } from 'src/enum/book-category.enum';
import { Status } from 'src/enum/status.enum';

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  book_th: string;

  @Prop({ required: true })
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



}
export type BookDocument = Book & Document;

export const BookSchema = SchemaFactory.createForClass(Book);