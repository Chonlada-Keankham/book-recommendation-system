import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { Types } from 'mongoose';
export class UpdateCommentDto {
  @IsOptional()
  @IsMongoId()
  commentId?: Types.ObjectId;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsMongoId()
  user?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  book?: Types.ObjectId;
}