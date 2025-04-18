// src/notification/interface/notification.interface.ts
import { NotificationType } from 'src/enum/notification-type.enum';

export interface iNotification {
  _id: string;
  userId: string;
  bookId?: string;
  commentId?: string;    // ← เพิ่ม
  type: NotificationType;
  message: string;
  link: string;          // ← เพิ่ม
  isRead: boolean;
  createdAt: Date;       // ← mongoose timestamps สร้างให้
  updatedAt: Date;
}
