import { NotificationType } from "src/enum/notification-type.enum";

export interface iNotification {
  _id?: string;
  userId: string;
  commentId?: string;
  message: string;
  bookId?: string;
  type: NotificationType;
  isRead: boolean;
  link: string; 
  created_at: Date;
}
