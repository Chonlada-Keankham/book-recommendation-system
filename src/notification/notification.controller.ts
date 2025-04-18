// src/notification/notification.controller.ts
import { Controller, Get, Patch, Delete, Req, Param, HttpStatus, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { Request } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @Get('/me')
  async getMyNotifications(@Req() req: Request) {
    const userId = req.user['_id'];
    const { notifications, unreadCount } =
      await this.notificationService.getNotificationsByUser(userId);
  
    // คืน notification พร้อมลิงก์
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications fetched successfully',
      data: notifications.map(n => ({
        _id: n._id,
        message: n.message,
        link: n.link,             // ← สำคัญ
        isRead: n.isRead,
        createdAt: n.createdAt,
        // … อื่น ๆ ตามต้องการ
      })),
      unreadCount,
    };
  }
    @Patch('read/:notificationId')
  async markAsRead(@Param('notificationId') id: string) {
    const updated = await this.notificationService.markAsRead(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification marked as read',
      data: updated,  // lean() not needed here since .findByIdAndUpdate returns the doc
    };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = req.user['_id'];
    const result = await this.notificationService.markAllAsRead(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'All notifications marked as read',
      data: result,
    };
  }

  @Delete('clear-read')
  async clearRead(@Req() req: Request) {
    const userId = req.user['_1d'];
    await this.notificationService.clearReadNotifications(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Read notifications cleared',
    };
  }
}
