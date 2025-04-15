import { CommentService } from './../comment/comment.service';
import { CommentModule } from './../comment/comment.module';
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectModel } from '@nestjs/mongoose';
import { iNotification } from './interface/notification.interface';
import { Model } from 'mongoose';

@Injectable()
export class NotificationService {

  constructor(
    @InjectModel('Comment') 
    private readonly notificationModule: Model<iNotification>,
    private readonly ommentService:CommentService
  ) { }



  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notification`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
