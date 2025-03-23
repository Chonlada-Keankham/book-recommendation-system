import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsString({ message: 'Content must be a string.' })
  @IsOptional()  
  content: string;  
}

