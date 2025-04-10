import { Redis } from 'ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Put, UploadedFile, UseInterceptors, forwardRef } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';
import { iBook } from './interface/book.interface';
import { CreateBookDto } from './dto/create-book.dto';
import { Status } from 'src/enum/status.enum';
import { BookCategory } from 'src/enum/book-category.enum';
import { UpdateBookDto } from './dto/update-book.dto';
import { PlaylistService } from 'src/playlist/playlist.service';

@Injectable()
export class BookService {
  private redisClient: Redis;

  constructor(
    @InjectModel('Book') private readonly bookModel: Model<iBook>,
    @Inject(forwardRef(() => PlaylistService))
    private readonly playlistService: PlaylistService,
  ) {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
      password: '',
      db: 0,
    });
  }

  // -------------------------------------------------------------------
  // 🔸 UTILITIES
  // -------------------------------------------------------------------
  async findRandomBooksByCategory(
    category: string,
    limit: number
  ): Promise<iBook[]> {
    return this.bookModel.aggregate([
      {
        $match: {
          category,
          status: { $ne: Status.DELETED },
          deleted_at: null
        }
      },
      {
        $sort: { view: -1 }
      },
      {
        $sample: { size: limit }
      }
    ]);
  }

  async findPopularBooksByAuthor(
    author: string,
    limit: number
  ): Promise<iBook[]> {
    return this.bookModel.find({
      author,
      status: { $ne: Status.DELETED },
      deleted_at: null
    })
      .sort({ view: -1 })
      .limit(limit)
      .exec();
  }

  async updateAllShortDescriptions(shortDescription: string): Promise<any> {
    const result = await this.bookModel.updateMany(
      {
        status: {
          $ne: Status.DELETED
        },
        deleted_at: null
      },
      {
        $set:
        {
          short_description: shortDescription
        }
      },
    );
    if (result.modifiedCount === 0) throw new NotFoundException('No books were updated');
    return result;
  }

  // -------------------------------------------------------------------
  // 🔸 CREATE
  // -------------------------------------------------------------------
  async createBook(createBookDto: CreateBookDto, filename: string): Promise<iBook> {
    const existingBook = await this.bookModel.findOne({
      $or: [
        { book_th: createBookDto.book_th },
        { book_en: createBookDto.book_en }
      ]
    });

    if (existingBook) {
      throw new Error('This book is already in the system.');
    }

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    const newBook = new this.bookModel({
      ...createBookDto,
      img: `${BACKEND_URL}/uploads/book${filename}`,
      deleted_at: null
    });

    return newBook.save();
  }

  // -------------------------------------------------------------------
  // 🔸 READ
  // -------------------------------------------------------------------
  async findOneByIdAndUpdateView(id: string, ip: string): Promise<iBook> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format.');
    }
  
    const redisKey = `viewed:${id}:${ip}`;
    const viewed = await this.redisClient.get(redisKey);
  
    if (!viewed) {
      const book = await this.bookModel.findOneAndUpdate(
        {
          _id: id,
          status: { $ne: Status.DELETED },
          deleted_at: null,
        },
        { $inc: { view: 1 } },
        { new: true }
      ).exec();
  
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found.`);
      }
  
      if (book.img) {
        book.img = `${process.env.BACKEND_URL}/uploads/book${book.img}`;
      }
  
      await this.redisClient.set(redisKey, 'true', 'EX', 300);  // Set to prevent multiple views
  
      return book;
    }
  
    return await this.bookModel.findOne({
      _id: id,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();
  }
  
  async findBooksByCategory(category: BookCategory, ip: string): Promise<{
    books: iBook[];
    total: number;
  }> {
    const total = await this.bookModel.countDocuments({
      category,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    const books = await this.bookModel.find({
      category,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();
  
    for (const book of books) {
      const redisKey = `viewed:${book._id}:${ip}`;
      const viewed = await this.redisClient.get(redisKey);
  
      if (!viewed) {
        await this.bookModel.findByIdAndUpdate(book._id, { $inc: { view: 1 } }).exec();
  
        if (book.img) {
          book.img = `${process.env.BACKEND_URL}/uploads/book${book.img}`;
        }
  
        await this.redisClient.set(redisKey, 'true', 'EX', 300);  
      }
    }
  
    return { books, total };
  }

  async findAll(ip: string): Promise<iBook[]> {
    const books = await this.bookModel.find({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();

    for (const book of books) {
      const redisKey = `viewed:${book._id}:${ip}`;
      const viewed = await this.redisClient.get(redisKey);

      if (!viewed) {
        await this.bookModel.findByIdAndUpdate(book._id, { $inc: { view: 1 } }).exec();
        await this.redisClient.set(redisKey, 'true', 'EX', 300);
      }
    }

    return books;
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE
  // -------------------------------------------------------------------

  async updateBook(
    bookId: string,
    updateBookDto: UpdateBookDto): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    const duplicate = await this.bookModel.findOne({
      _id: { $ne: bookId },
      $or: [
        { book_th: updateBookDto.book_th },
        { book_en: updateBookDto.book_en }
      ]
    });
    if (duplicate) {
      throw new ConflictException('A book with the same title already exists.');
    }

    const updatedData = {
      ...updateBookDto,
      updated_at: new Date(),
    };

    return await this.bookModel.findByIdAndUpdate(bookId, updatedData, { new: true });
  }

  async uploadBookCover(bookId: string, filename: string): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    book.img = `/uploads/book/${filename}`;

    return await book.save();
  }

  // -------------------------------------------------------------------
  // 🔸 RECOMMENDATION
  // -------------------------------------------------------------------
  async recommendBooksForGuest(category: BookCategory, bookId: string, ip: string): Promise<{ book: iBook; recommendedBooks: iBook[] }> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book ID format.');
    }
  
    const redisKey = `viewed:${bookId}:${ip}`;
    const viewed = await this.redisClient.get(redisKey);
  
    if (!viewed) {
      const book = await this.bookModel.findOneAndUpdate(
        {
          _id: bookId,
          status: { $ne: Status.DELETED },
          deleted_at: null,
        },
        { $inc: { view: 1 } },
        { new: true }
      ).exec();
  
      if (!book) {
        throw new NotFoundException('Book not found.');
      }
  
      if (book.img) {
        book.img = `${process.env.BACKEND_URL}/uploads/book${book.img}`;
      }
  
      await this.redisClient.set(redisKey, 'true', 'EX', 300);  // Prevent multiple views
  
      const recommendedBooks = await this.bookModel.find({
        category,
        _id: { $ne: bookId },
        status: { $ne: Status.DELETED },
        deleted_at: null,
      }).sort({ view: -1 });
  
      return { book, recommendedBooks };
    }
  
    return await this.bookModel.findOne({
      _id: bookId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec().then((book) => {
      return { book, recommendedBooks: [] };
    });
  }
  
  async recommendBooksForMember(userId: string, currentBookId: string, ip: string): Promise<iBook[]> {
    const playlist = await this.playlistService.getPlaylist(userId);
    if (!playlist) throw new NotFoundException('Playlist not found');
  
    const currentBook = await this.bookModel.findOneAndUpdate(
      {
        _id: currentBookId,
        status: { $ne: Status.DELETED },
        deleted_at: null,
      },
      { $inc: { view: 1 } },
      { new: true }
    ).exec();
  
    if (!currentBook) throw new NotFoundException('Current book not found');
  
    // ปรับให้ตรวจสอบและแก้ไข img ของ currentBook
    if (currentBook.img) {
      currentBook.img = `${process.env.BACKEND_URL}/uploads/book${currentBook.img}`;
    }
  
    // Prevent multiple views
    const redisKey = `viewed:${currentBookId}:${ip}`;
    const viewed = await this.redisClient.get(redisKey);
    if (!viewed) {
      await this.redisClient.set(redisKey, 'true', 'EX', 300);
    }
  
    const seen = new Set<string>();
    const dedup = (books: iBook[]) =>
      books.filter((b) => {
        const id = b._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
  
    const group1 = await this.bookModel.find({
      category: currentBook.category,
      _id: { $ne: currentBookId },
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).sort({ view: -1, createdAt: -1 }).exec();
  
    const group2 = await this.bookModel.find({
      category: { $in: playlist.categories },
      _id: { $ne: currentBookId },
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).sort({ createdAt: -1 }).exec();
  
    const group3 = await this.bookModel.find({
      author: { $in: playlist.authors },
      _id: { $ne: currentBookId },
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).sort({ createdAt: -1 }).exec();
  
    // สำหรับหนังสือแนะนำในแต่ละกลุ่ม ให้แก้ไข img ของหนังสือที่แนะนำด้วย
    const recommendedBooks = [
      ...dedup(group1),
      ...dedup(group2),
      ...dedup(group3),
    ];
  
    recommendedBooks.forEach((recommendedBook) => {
      if (recommendedBook.img) {
        recommendedBook.img = `${process.env.BACKEND_URL}/uploads/book${recommendedBook.img}`;
      }
    });
  
    return recommendedBooks;
  }
  
  // -------------------------------------------------------------------
  // 🔸 DELETE
  // -------------------------------------------------------------------

  async softDelete(bookId: string): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');
    if (book.status === Status.DELETED) throw new ConflictException('Book is already deleted');

    book.status = Status.DELETED;
    book.deleted_at = new Date();
    return book.save();
  }

  async deleteById(bookId: string): Promise<boolean> {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    await this.bookModel.deleteOne({ _id: bookId });
    return true;
  }
}
