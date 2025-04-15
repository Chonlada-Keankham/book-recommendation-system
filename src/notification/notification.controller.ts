import { Controller, Get, Param, Patch, HttpStatus, UseGuards, Req, Delete } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // -------------------------------------------------------------------
  // 🔸 FETCH
  // -------------------------------------------------------------------

  @Get('/user/:userId')
  @ApiOperation({ summary: 'Get notifications for a user' })
  @ApiResponse({ status: 200, description: 'Notifications fetched successfully' })
  async getNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationService.getNotificationsByUser(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications fetched successfully',
      data: notifications,
    };
  }
  
  @Get('/me')
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications fetched successfully' })
  async getMyNotifications(@Req() req: Request) {
    const userId = req.user['_id'];
    const notifications = await this.notificationService.getNotificationsByUser(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications fetched successfully',
      data: notifications,
    };
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE
  // -------------------------------------------------------------------

  @Patch('/read/:notificationId')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Param('notificationId') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  @Patch('/read-all/:userId')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Param('userId') userId: string) {
    const result = await this.notificationService.markAllAsRead(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'All notifications marked as read',
      data: result,
    };
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE
  // -------------------------------------------------------------------

  @Delete('/clear-read/:userId')
  @ApiOperation({ summary: 'Clear read notifications for a user' })
  @ApiResponse({ status: 200, description: 'Read notifications cleared' })
  async clearRead(@Param('userId') userId: string) {
    const result = await this.notificationService.clearReadNotifications(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Read notifications cleared',
      data: result,
    };
  }
}
