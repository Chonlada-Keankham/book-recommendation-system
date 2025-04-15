import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { CommentSchema } from './schema/comment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    BookModule,
    MongooseModule.forFeature([{ name: 'Comment', schema: CommentSchema }]),
  ],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [
    CommentService,
    MongooseModule

  ],
})
export class CommentModule { }