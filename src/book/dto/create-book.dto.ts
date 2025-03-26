import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { BookCategory } from "src/enum/book-category.enum";

export class CreateBookDto {

        @IsNotEmpty({ message: 'Book title (in Thai) is required.' })
        @IsString({ message: 'Book title must be a string.' })
        @Matches(/^[ก-๙0-9\s]+$/, { message: 'ชื่อหนังสือภาษาไทยต้องมีแต่ตัวอักษรไทยและตัวเลขเท่านั้น' })
        book_th: string;

        @IsNotEmpty({ message: 'Book title (in English) is required.' })
        @IsString({ message: 'Book title must be a string.' })
        @Matches(/^[a-zA-Z0-9\s]+$/, { message: 'ชื่อหนังสือภาษาอังกฤษต้องมีแต่ตัวอักษรอังกฤษและตัวเลขเท่านั้น' })
        book_en: string;
        
        @IsNotEmpty({ message: 'Image URL is required.' })
        @IsString({ message: 'Image URL must be a string.' })
        img: string;

        @IsNotEmpty({ message: 'Author is required.' })
        @IsString({ message: 'Author must be a string.' })
        author: string;

        @IsNotEmpty({ message: 'Category is required.' })
        @IsEnum(BookCategory, { message: 'Invalid category.' })
        category: BookCategory;

        @IsOptional()
        @IsInt({ message: 'View must be an integer.' })
        view: number = 0;
}
