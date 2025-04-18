import { NotificationType } from "src/enum/notification-type.enum";

export interface iNotification {
  _id: string;
  userId: string;
  message: string;
  bookId?: string;
  commentId?: string;
  link: string;
  isRead: boolean;
  type: NotificationType;
  createdAt: Date;
  updatedAt: Date;
}
