import { Book } from "src/book/schema/book.schema";
import { BookCategory } from "src/enum/book-category.enum";
import { User } from "src/user/schema/user.schema";

export interface iPlaylist {
    _id?: string;
    selected_categories: BookCategory[];
    selected_authors?: string[];
    recommended_books: Book[];
    created_by: User;
    created_at: Date;
    updated_at: Date;
    deleted_at?: Date;
}