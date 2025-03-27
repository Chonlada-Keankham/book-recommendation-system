import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Book } from 'src/book/schema/book.schema';
import { BookCategory } from 'src/enum/book-category.enum'; // Enum ของหมวดหมู่หนังสือ
import { User } from 'src/user/schema/user.schema';

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ type: [String], required: true, enum: Object.values(BookCategory) })
  selected_categories: BookCategory[]; 

  @Prop({ type: [String], required: false })
  selected_authors: string[]; 

  @Prop({ type: [{ type: String, ref: 'Book' }], required: true })
  recommended_books: Book[]; 

  @Prop({ type: String, required: true, ref: 'User' })
  created_by: User; 

  @Prop({ type: Date, default: Date.now })
  updated_at: Date; 
}

export type PlaylistDocument = Playlist & Document;

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
