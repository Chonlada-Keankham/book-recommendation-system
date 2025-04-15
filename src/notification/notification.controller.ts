import { Controller, Get, Param, Patch, HttpStatus, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

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
}