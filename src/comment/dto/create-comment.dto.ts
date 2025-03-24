import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Book is required.' })
  @IsMongoId({ message: 'Book ID must be a valid ObjectId.' })
  book: Types.ObjectId;  

  @IsNotEmpty({ message: 'User is required.' })
  @IsMongoId({ message: 'User ID must be a valid ObjectId.' })
  user: Types.ObjectId;  

  @IsString({ message: 'Content must be a string.' })
  @IsOptional()  
  content: string;

  @IsMongoId({ message: 'Comment ID must be a valid ObjectId.' })
  @IsOptional() 
  commentId?: Types.ObjectId; 
}