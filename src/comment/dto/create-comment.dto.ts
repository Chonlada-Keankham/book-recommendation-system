import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCommentDto {
  @IsNotEmpty()
  book: Types.ObjectId;

  @IsNotEmpty()
  user: Types.ObjectId;

  @IsNotEmpty()
  content: string;
}

