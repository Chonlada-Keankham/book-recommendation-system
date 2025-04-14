// src/comment/dto/create-reply.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReplyDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
