import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { PlaylistService } from 'src/playlist/playlist.service';
import { iNotification } from './interface/notification.interface';
import { iBook } from 'src/book/interface/book.interface';
import { UserService } from 'src/user/user.service';
import { CommentService } from 'src/comment/comment.service';
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

    
// 🔔 แจ้งเตือนเมื่อมีหนังสือใหม่ (เฉพาะสมาชิกที่สนใจหมวดนี้)
async notifyNewBookToMembers(book: iBook): Promise<void> {
  const playlists = await this.playlistService.findPlaylistsByCategory(book.category);
  const memberIds = playlists.map(p => p.user.toString());

  if (!memberIds.length) return;

  const notifications = memberIds.map(userId => ({
    userId,
    type: 'new-book',
    message: `หนังสือใหม่ "${book.book_th}" สำหรับสมาชิก "${book.category}"`,
    bookId: book._id,
    isRead: false,
    created_at: new Date(),
  }));

  await this.notificationModel.insertMany(notifications);
}

// 💬 แจ้งเตือนเมื่อมีคนตอบคอมเมนต์ของตนเอง
async notifyReply(originalUserId: string, bookId: string, bookTitle: string): Promise<void> {
  await this.notificationModel.create({
    userId: originalUserId,
    bookId,
    type: 'comment-reply',
    message: `มีคนตอบกลับคอมเมนต์ในหนังสือ "${bookTitle}"`,
    isRead: false,
    created_at: new Date(),
  });
}

// 📥 ดึงการแจ้งเตือนทั้งหมดของผู้ใช้
async getNotificationsByUser(userId: string): Promise<iNotification[]> {
  return this.notificationModel.find({ userId }).sort({ created_at: -1 }).exec();
}

// ✅ อัปเดตสถานะการอ่านแจ้งเตือน
async markAsRead(notificationId: string): Promise<iNotification> {
  return this.notificationModel.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
}
}