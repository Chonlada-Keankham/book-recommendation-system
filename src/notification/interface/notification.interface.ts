import { NotificationType } from "src/enum/notification-type.enum";

export interface iNotification {
  _id: string;
  userId: string;
  bookId?: string;
  commentId?: string;    // ← must match schema
  link: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
