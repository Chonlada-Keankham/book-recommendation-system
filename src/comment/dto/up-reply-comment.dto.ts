import { IsString, IsOptional } from 'class-validator';

export class UpdateReplyDto {
  @IsString()
  @IsOptional()
  content?: string;   
}
