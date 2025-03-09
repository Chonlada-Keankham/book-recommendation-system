import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookSchema } from './schema/book.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema }]),
  ],

  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule { }
