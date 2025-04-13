import { Redis } from 'ioredis';
import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Put, UploadedFile, UseInterceptors, forwardRef } from '@nestjs/common';
import { Model, Types } from 'mongoose';
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

    ]);
  }

  async findPopularBooksByAuthor(
    author: string,
  ): Promise<iBook[]> {
    return this.bookModel.find({
      author,
      status: { $ne: Status.DELETED },
      deleted_at: null
    })
      .sort({ view: -1 })
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
  async createBook(createBookDto: CreateBookDto, file?: Express.Multer.File): Promise<iBook> {
    const existing = await this.bookModel.findOne({
      $or: [{ book_th: createBookDto.book_th }, { book_en: createBookDto.book_en }]
    });
    if (existing) throw new ConflictException('Book already exists.');
  
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    
    const imgPath = file ? `${BACKEND_URL}/uploads/book/${file.filename}` : '';
  
    const newBook = new this.bookModel({
      ...createBookDto,
      img: imgPath,
      short_description: createBookDto.short_description || '',  
      deleted_at: null,
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
  
    let book: iBook;
    if (!viewed) {
      book = await this.bookModel.findOneAndUpdate(
        {
          _id: id,
          status: { $ne: Status.DELETED },
          deleted_at: null,
        },
        { $inc: { view: 1 } },
        { new: true },
      ).exec();
      await this.redisClient.set(redisKey, 'true', 'EX', 300);
    } else {
      book = await this.bookModel.findOne({
        _id: id,
        status: { $ne: Status.DELETED },
        deleted_at: null,
      }).exec();
    }
  
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found.`);
    }
  
    // ✅ ปรับ path รูป
    if (book.img && !book.img.startsWith('http')) {
      book.img = `${process.env.BACKEND_URL}${book.img.startsWith('/') ? '' : '/'}${book.img}`;
    }
  
    return book;
  }
  
  async findBooksByCategory(category: BookCategory): Promise<{
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
  
    return { books, total };
  }
      
  async findNovelBooks(): Promise<{ books: iBook[]; total: number }> {
    return this.findBooksByCategory(BookCategory.NOVEL);
  }
  
  async findTravelBooks(): Promise<{ books: iBook[]; total: number }> {
    return this.findBooksByCategory(BookCategory.TRAVEL);
  }
  
  async findBusinessBooks(): Promise<{ books: iBook[]; total: number }> {
    return this.findBooksByCategory(BookCategory.BUSINESS);
  }
  
  async findSportBooks(): Promise<{ books: iBook[]; total: number }> {
    return this.findBooksByCategory(BookCategory.SPORT);
  }
  
  async findEducationBooks(): Promise<{ books: iBook[]; total: number }> {
    return this.findBooksByCategory(BookCategory.EDUCATION);
  }
    
  async findAll(): Promise<iBook[]> {
    return this.bookModel.find({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();
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
  async recommendBooksForGuest(
    category: BookCategory,
    bookId: string,
  ): Promise<{ book: iBook; recommendedBooks: iBook[] }> {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book ID format.');
    }
  
    if (!category) {
      throw new BadRequestException('Category is required.');
    }
  
    // ✅ เปลี่ยนจาก findOneAndUpdate ➔ เป็น findOne เฉยๆ
    const book = await this.bookModel.findOne({
      _id: bookId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();
  
    if (!book) {
      throw new NotFoundException('Book not found.');
    }
  
    const recommendedBooks = await this.bookModel.find({
      category,
      _id: { $ne: bookId },
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).sort({ view: -1 }).exec();
  
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

  async getDailyRecommendedBooks(topN = 50): Promise<iBook[]> {
    const topBooks = await this.bookModel.find({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    })
      .sort({ view: -1 })
      .limit(topN)
      .select('book_th book_en img author category view short_description') // << เพิ่มตรงนี้
      .lean();  
  
    if (topBooks.length === 0) {
      throw new NotFoundException('No books available for recommendation.');
    }
  
    const today = new Date().toISOString().slice(0, 10); 
    const seed = today.split('-').join('');
    let pseudoRandomSeed = parseInt(seed, 10);
  
    const random = () => {
      const x = Math.sin(pseudoRandomSeed++) * 10000;
      return x - Math.floor(x);
    };
  
    const shuffled = topBooks
      .map(book => {
        if (book.img) {
          if (book.img.startsWith('http')) {
            try {
              const url = new URL(book.img);
              book.img = url.pathname;  
            } catch (err) {
            }
          }
        }
        return { book, sort: random() };
      })
      .sort((a, b) => a.sort - b.sort)
      .map(({ book }) => book);
  
    return shuffled;
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

//------------------------------------
  async updateBookCoverByCategory(category: string, filename: string): Promise<iBook[]> {
    const books = await this.bookModel.find({ category });

    if (!books || books.length === 0) {
      throw new NotFoundException('No books found in this category.');
    }

    for (let book of books) {
      book.img = `/uploads/book/${filename}`; 
      await book.save(); 
    }

    return books; 
  }

  // -------------------------------------------------------------------
// 🔸 INCREASE VIEW AFTER DELAY (NEW)
// -------------------------------------------------------------------

async increaseViewAfterDelay(bookId: string, ip: string): Promise<iBook> {
  if (!Types.ObjectId.isValid(bookId)) {
    throw new BadRequestException('Invalid Book ID');
  }

  const redisKey = `viewed_api:${bookId}:${ip}`;
  const viewed = await this.redisClient.get(redisKey);

  if (viewed) {
    throw new BadRequestException('You have already viewed this book recently.');
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

  await this.redisClient.set(redisKey, 'true', 'EX', 300); // 5 นาที กัน view ซ้ำ
  return book;
}

}


