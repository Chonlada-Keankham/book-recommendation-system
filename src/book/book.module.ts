import { PlaylistModule } from 'src/playlist/playlist.module';
import { Module, forwardRef } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schema/book.schema';

@Module({
  imports: [
    forwardRef(() => PlaylistModule),

    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
  ],

  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule { }
