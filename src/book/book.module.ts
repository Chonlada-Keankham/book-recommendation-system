import { PlaylistModule } from 'src/playlist/playlist.module';
import { Module, forwardRef } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schema/book.schema';
import { NotificationModule } from 'src/notification/notification.module';
import { RedisModule } from 'src/redis/redis.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    forwardRef(() => PlaylistModule),
    forwardRef(() => NotificationModule),
    RedisModule,
    CloudinaryModule,
    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
  ],

  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule { }
