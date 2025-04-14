import { IsString, IsOptional } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  content?: string;   // 🖊️ อัปเดตเนื้อหาได้ ไม่บังคับกรอก
}
