export interface iNotification {
  _id?: string;
  userId: string;
  message: string;
  bookId?: string;
  isRead: boolean;
  created_at: Date;
}