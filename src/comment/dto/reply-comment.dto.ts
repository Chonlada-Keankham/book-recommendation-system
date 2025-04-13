export class CreateReplyDto {
    commentId: string;   // ID ของ Comment หลัก
    user: string;        // ผู้ตอบกลับ
    content: string;     // ข้อความตอบกลับ
  }
  