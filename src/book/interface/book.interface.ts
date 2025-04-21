import { BookCategory } from "src/enum/book-category.enum";
import { Status } from "src/enum/status.enum";

export interface iBook {
  _id?: string;
  book_th: string;
  book_en: string;
  img: string;
  author: string;
  category: BookCategory;
  status: Status;
  view: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  img_public_id: string ,
  short_description?: string;
}
