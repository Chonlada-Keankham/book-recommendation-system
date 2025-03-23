import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  content?: string;
}
