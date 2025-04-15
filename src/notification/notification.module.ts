import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationSchema } from './schema/notification.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentModule } from 'src/comment/comment.module';
import { UserModule } from 'src/user/user.module';
import { PlaylistModule } from 'src/playlist/playlist.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema }]),
    CommentModule,
    UserModule,
    PlaylistModule,
  ],

  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService]
})
export class NotificationModule { }
