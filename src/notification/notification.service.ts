import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PlaylistService } from 'src/playlist/playlist.service';
import { iNotification } from './interface/notification.interface';
import { iBook } from 'src/book/interface/book.interface';
import { UserService } from 'src/user/user.service';
import { CommentService } from 'src/comment/comment.service';
import { NotificationType } from 'src/enum/notification-type.enum';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<iNotification>,

    @Inject(forwardRef(() => PlaylistService))
    private readonly playlistService: PlaylistService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(forwardRef(() => CommentService))
    private readonly commentService: CommentService,
  ) {}

  // -------------------------------------------------------------------
  // 🔸 CREATE NOTIFICATIONS
  // -------------------------------------------------------------------

  // แจ้งเตือนสมาชิกที่สนใจเมื่อมีหนังสือใหม่
  async notifyNewBookToMembers(book: iBook): Promise<void> {
    const playlists = await this.playlistService.findPlaylistsByCategory(book.category);
    const memberIds = playlists.map(p => p.user.toString());
  
    if (!memberIds.length) return;
  
    const notifications = memberIds.map(userId => ({
      userId,
      type: NotificationType.NEW_BOOK,
      message: `หนังสือใหม่ "${book.book_th}" สำหรับสมาชิก "${book.category}"`,
      bookId: book._id,
      isRead: false,
      created_at: new Date(),
    }));
  
    await this.notificationModel.insertMany(notifications);
  }

  // แจ้งเตือนเมื่อมีคนกดไลค์คอมเมนต์
  async notifyLikeComment(
    userId: string,
    bookId: string,
    bookTitle: string,
    commentId: string,
  ): Promise<void> {
    await this.notificationModel.create({
      userId,
      bookId,
      commentId,
      type: NotificationType.LIKE_COMMENT,
      message: `มีคนกดถูกใจคอมเมนต์ของคุณในหนังสือ "${bookTitle}"`,
      isRead: false,
      created_at: new Date(),
    });
  }

  // แจ้งเตือนเมื่อมีคนกดไลค์คำตอบ
  async notifyLikeReply(
    userId: string,
    bookId: string,
    bookTitle: string,
    commentId: string,
  ): Promise<void> {
    await this.notificationModel.create({
      userId,
      bookId,
      commentId,
      type: NotificationType.LIKE_REPLY,
      message: `มีคนกดถูกใจคำตอบของคุณในหนังสือ "${bookTitle}"`,
      isRead: false,
      created_at: new Date(),
    });
  }

  // แจ้งเตือนเจ้าของคอมเมนต์เมื่อมีคนตอบกลับ
  async notifyReply(
    originalUserId: string,
    bookId: string,
    bookTitle: string,
    commentId: string,
  ): Promise<void> {
    await this.notificationModel.create({
      userId: originalUserId,
      bookId,
      commentId,
      type: NotificationType.COMMENT_REPLY,
      message: `มีคนตอบกลับคอมเมนต์ของคุณในหนังสือ "${bookTitle}"`,
      isRead: false,
      created_at: new Date(),
    });
  }

  // -------------------------------------------------------------------
  // 🔸 FETCH NOTIFICATIONS
  // -------------------------------------------------------------------

  async getNotificationsByUser(userId: string): Promise<{
    notifications: iNotification[],
    unreadCount: number
  }> {
    const notifications = await this.notificationModel.find({ userId }).sort({ created_at: -1 }).exec();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return {
      notifications,
      unreadCount,
    };
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE NOTIFICATION STATUS
  // -------------------------------------------------------------------

  async markAsRead(notificationId: string): Promise<iNotification> {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE READ NOTIFICATIONS
  // -------------------------------------------------------------------

  async clearReadNotifications(userId: string) {
    return this.notificationModel.deleteMany({ userId, isRead: true });
  }
}
