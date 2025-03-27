import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { BookCategory } from "src/enum/book-category.enum";

export class CreatePlaylistDto {
    @IsArray()
  @IsEnum(() => BookCategory, { each: true, message: 'หมวดหมู่ต้องเป็นหนึ่งในค่าที่กำหนดใน BookCategory' })
  selected_categories: BookCategory[]; 

  @IsArray()
  @IsOptional()
  @IsString({ each: true, message: 'ผู้แต่งหนึ่ง, ผู้แต่งสอง, ผู้แต่งสาม, ผู้แต่งสี่, ผู้แต่งห้า' })
  selected_authors?: string[]; 

  @IsArray()
  @IsUUID('all', { each: true, message: 'recommended_books ต้องเป็น UUID ของหนังสือ' })
  recommended_books: string[]; 
  
  }