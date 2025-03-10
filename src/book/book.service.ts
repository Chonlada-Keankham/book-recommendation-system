import { InjectModel } from '@nestjs/mongoose';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { iBook } from './interface/book.interface';
import { CreateBookDto } from './dto/create-book.dto';
import { Status } from 'src/enum/status.enum';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(
    @InjectModel('Book')
    private readonly bookModel: Model<iBook>,
  ) { }

  async createOne(createBookDto: CreateBookDto): Promise<iBook> {
    const existingBook = await this.bookModel.findOne({
      $or: [
        { book_th: createBookDto.book_th },  
        { book_en: createBookDto.book_en }   
      ]
    });
  
    if (existingBook) {
      throw new Error('หนังสือเล่มนี้มีอยู่แล้วในระบบ');
    }
  
    const newBook = new this.bookModel({
      ...createBookDto,
      deleted_at: null,
      status: Status.ACTIVE,
    });
  
    return await newBook.save();
  }
  
  async createMany(createBookDto: CreateBookDto[]): Promise<iBook[]> {
    const booksInDb = await this.bookModel.find({
      $or: createBookDto.map(dto => ({
        $or: [
          { book_th: dto.book_th },
          { book_en: dto.book_en }
        ]
      }))
    });
  
    const existingBookTitles = booksInDb.map(book => book.book_th); 
  
    const booksToInsert = createBookDto.filter(dto => 
      !existingBookTitles.includes(dto.book_th) && !existingBookTitles.includes(dto.book_en)
    ).map(dto => ({
      ...dto,
      deleted_at: null,
      status: Status.ACTIVE,
    }));
  
    if (booksToInsert.length > 0) {
      return await this.bookModel.insertMany(booksToInsert);
    } else {
      throw new Error('ไม่มีหนังสือที่สามารถเพิ่มได้ เนื่องจากทั้งหมดมีอยู่ในระบบแล้ว');
    }
  }
  
  async findOneById(id: string): Promise<iBook> {
    const book = await this.bookModel.findOne({
      _id: id,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found or has been deleted.`);
    }

    return book;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ books: iBook[], total: number }> {
    const skip = (page - 1) * limit;
    const total = await this.bookModel.countDocuments({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });

    const books = await this.bookModel.find(
      { status: { $ne: Status.DELETED }, deleted_at: null },
    )
      .skip(skip)
      .limit(limit)
      .exec();
    return { books, total };
  }

  async updateOne(bookId: string, updateBookDto: UpdateBookDto): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const updatedBookDto = {
      ...updateBookDto,
      updated_at: new Date(),
    };

    return await this.bookModel.findByIdAndUpdate(bookId, updatedBookDto, { new: true });
  }

  async softDelete(bookId: string): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);
  
    if (!book) {
      throw new NotFoundException('Book not found');
    }
  
    if (book.status === Status.DELETED) {
      throw new ConflictException('Book is already deleted');
    }
  
    book.status = Status.DELETED;
    book.deleted_at = new Date();
  
    return await book.save();
  }

    async deleteById(bookId: string): Promise<boolean> {
    const user = await this.bookModel.findById(bookId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.bookModel.deleteOne({ _id: bookId });
    return true;
  }
}
