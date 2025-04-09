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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiOperation } from '@nestjs/swagger';

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
          deleted_at: null
        },
        {
          $inc: { view: 1 }
        },
        { new: true }
      ).exec();
  
      if (!book) {
        throw new NotFoundException(`Book with ID ${id} not found.`);
      }
  
      book.img = `${process.env.BACKEND_URL}/uploads/book${book.img}`;
  
      await this.redisClient.set(redisKey, 'true', 'EX', 300);
  
      return book;
    }
  
    return await this.bookModel.findOne({
      _id: id,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();
  }
  
  async findBooksByCategory(category: BookCategory, ip: string): Promise<{
    books: iBook[],
    total: number
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

  async depthSearch(
    category?: string,
    author?: string,
    minViews?: number,
    maxViews?: number,
    page = 1,
    limit = 10
  ): Promise<{
    data: iBook[];
    total: number
  }> {
    const skip = (page - 1) * limit;
    const aggregation: PipelineStage[] = [];

    if (category) aggregation.push({ $match: { category } });
    if (author) aggregation.push({ $match: { author } });
    if (minViews !== undefined || maxViews !== undefined) {
      const viewFilter: any = {};
      if (minViews !== undefined) viewFilter.$gte = minViews;
      if (maxViews !== undefined) viewFilter.$lte = maxViews;
      aggregation.push({ $match: { view: viewFilter } });
    }

    const totalResult = await this.bookModel.aggregate([
      ...aggregation,
      { $count: "total" }]);
    const total = totalResult[0]?.total || 0;

    aggregation.push({ $sort: { view: -1 } });
    aggregation.push({ $skip: skip });
    aggregation.push({ $limit: limit });

    const books = await this.bookModel.aggregate(aggregation);
    return { data: books, total };
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

  async updateView(bookId: string): Promise<iBook> {
    const updated = await this.bookModel.findByIdAndUpdate(
      bookId,
      { $inc: { view: 1 } },
      { new: true }
    ).exec();

    if (!updated) throw new NotFoundException('Book not found');
    return updated;
  }

  async uploadBookCover(bookId: string, filename: string): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);
    if (!book) throw new NotFoundException('Book not found');

    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    book.img = `${BACKEND_URL}/uploads/book${filename}`;

    return await book.save();
  }

  // -------------------------------------------------------------------
  // 🔸 RECOMMENDATION
  // -------------------------------------------------------------------
  async recommendBooksForGuest(
    category: BookCategory,
    bookId: string,
    limit?: number
  ): Promise<{ book: iBook; recommendedBooks: iBook[] }> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book ID format.');
    }

    if (!category) {
      throw new BadRequestException('Category is required.');
    }

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

    const query = this.bookModel.find({
      category,
      _id: { $ne: bookId },
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).sort({ view: -1 });

    if (limit && limit > 0) {
      query.limit(limit);
    }

    const recommendedBooks = await query.exec();

    return { book, recommendedBooks };
  }

  async recommendBooksForMember(
    userId: string,
    currentBookId: string
  ): Promise<iBook[]> {
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

    const seen = new Set<string>();
    const dedup = (books: iBook[]) =>
      books.filter((b) => {
        const id = b._id.toString();
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });

    const group1 = await this.bookModel
      .find({
        category: currentBook.category,
        _id: { $ne: currentBookId },
        status: { $ne: Status.DELETED },
        deleted_at: null,
      })
      .sort({ view: -1, createdAt: -1 })
      .exec();

    const group2 = await this.bookModel
      .find({
        category: { $in: playlist.categories },
        _id: { $ne: currentBookId },
        status: { $ne: Status.DELETED },
        deleted_at: null,
      })
      .sort({ createdAt: -1 })
      .exec();

    const group3 = await this.bookModel
      .find({
        author: { $in: playlist.authors },
        _id: { $ne: currentBookId },
        status: { $ne: Status.DELETED },
        deleted_at: null,
      })
      .sort({ createdAt: -1 })
      .exec();

    return [...dedup(group1), ...dedup(group2), ...dedup(group3)];
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
