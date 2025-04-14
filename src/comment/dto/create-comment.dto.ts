import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsMongoId({ message: 'Book ID must be a valid MongoDB ObjectId.' })
  @IsNotEmpty()
  bookId: string;     

  @IsString()
  @IsNotEmpty()
  content: string;
}
