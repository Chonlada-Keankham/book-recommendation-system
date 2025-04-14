import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId({ message: 'Book ID must be a valid MongoDB ObjectId.' })
  @IsNotEmpty()
  bookId: string;     // รับเป็น string, แต่ validate ว่าต้องเป็น ObjectId

  @IsString()
  @IsNotEmpty()
  content: string;
}
