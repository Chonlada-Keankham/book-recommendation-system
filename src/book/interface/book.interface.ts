import { BookCategory } from "src/enum/book-category.enum";

export interface iBook {
    _id?: string;
  book_th: string;
  book_en: string;
  img: string;
  author: string;
  category: BookCategory;
  view: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
