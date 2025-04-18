import {
  Controller,
  Get,
  Param,
  Patch,
  HttpStatus,
  UseGuards,
  Req,
  Delete,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  // -------------------------------------------------------------------
  // 🔹 GET: All notifications for current user
  // -------------------------------------------------------------------
  @Get('/me')
  @ApiOperation({ summary: 'Get notifications for current user' })
  @ApiResponse({ status: 200, description: 'Notifications fetched successfully' })
  async getMyNotifications(@Req() req: Request) {
    const userId = req.user['_id'];
    const result = await this.notificationService.getNotificationsByUser(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications fetched successfully',
      data: result.notifications,
      unreadCount: result.unreadCount,
    };
  }

  // -------------------------------------------------------------------
  // 🔹 PATCH: Read one notification
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

  // -------------------------------------------------------------------
  // 🔹 PATCH: Read all for current user
  // -------------------------------------------------------------------
  @Patch('/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: Request) {
    const userId = req.user['_id'];
    const result = await this.notificationService.markAllAsRead(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'All notifications marked as read',
      data: result,
    };
  }

  // -------------------------------------------------------------------
  // 🔹 DELETE: Clear read notifications for current user
  // -------------------------------------------------------------------
  @Delete('/clear-read')
  @ApiOperation({ summary: 'Clear read notifications for current user' })
  @ApiResponse({ status: 200, description: 'Read notifications cleared' })
  async clearRead(@Req() req: Request) {
    const userId = req.user['_id'];
    const result = await this.notificationService.clearReadNotifications(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Read notifications cleared',
      data: result,
    };
  }

  // -------------------------------------------------------------------
  // 🔹 (Optional) ADMIN or DEBUG only - get by userId
  // -------------------------------------------------------------------
  @Get('/user/:userId')
  @ApiOperation({ summary: '[ADMIN] Get notifications for a user (by ID)' })
  @ApiResponse({ status: 200, description: 'Notifications fetched successfully' })
  async getNotificationsByUser(@Param('userId') userId: string) {
    const result = await this.notificationService.getNotificationsByUser(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Notifications fetched successfully',
      data: result.notifications,
      unreadCount: result.unreadCount,
    };
  }
}
