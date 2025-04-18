import { NotificationType } from "src/enum/notification-type.enum";

export interface iNotification {
  _id?: string;
  userId: string;
  message: string;
  bookId?: string;
  type: NotificationType;
  isRead: boolean;
  created_at: Date;
}
