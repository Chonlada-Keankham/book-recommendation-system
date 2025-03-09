import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { iBook } from './interface/book.interface';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel('Book')
    private readonly bookModel: Model<iBook>,
  ) { }
  
  async createOne(createBookDto: CreateBookDto): Promise<iBook> {
    const newBook = new this.bookModel(createBookDto);
    return await newBook.save();
  }
  

}
