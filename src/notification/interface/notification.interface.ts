import { NotificationSchema } from "../schema/notification.schema";

export interface iNotification {
  _id?: string;
  userId: string;
  message: string;
  bookId?: string;
  type: 'new-book' | 'comment-reply';
  isRead: boolean;
  created_at: Date;
}