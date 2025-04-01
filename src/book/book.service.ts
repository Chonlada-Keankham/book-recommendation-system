import { InjectModel } from '@nestjs/mongoose';
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Model, PipelineStage, Types } from 'mongoose';
import { iBook } from './interface/book.interface';
import { CreateBookDto } from './dto/create-book.dto';
import { Status } from 'src/enum/status.enum';
import { BookCategory } from 'src/enum/book-category.enum';
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
      throw new Error('This book is already in the system.');
    }

    const newBook = new this.bookModel({
      ...createBookDto,
      deleted_at: null,
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
      throw new Error('There are no books that can be added as they are all already in the system.');
    }
  }

  async findOneById(id: string): Promise<iBook> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid ID format.');
    }
  
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

  async updateCoverImage(bookId: string, img: string): Promise<iBook> {
    const book = await this.bookModel.findById(bookId);

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    book.img = img;

    return await book.save();
  }

  async updateView(bookId: string): Promise<iBook> {
    try {
      const updatedBook = await this.bookModel.findByIdAndUpdate(
        bookId,
        { $inc: { view: 1 } },
        { new: true }
      ).exec();

      if (!updatedBook) {
        throw new NotFoundException(`Book with ID "${bookId}" not found`);
      }

      return updatedBook;
    } catch (error) {
      console.error(`Error updating views for book with ID "${bookId}":`, error);
      throw new NotFoundException('Failed to update views for book');
    }
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

  async depthSearch(
    category?: string,
    author?: string,
    minViews?: number,
    maxViews?: number,
    pageNumber: number = 1,
    limitNumber: number = 10
  ): Promise<{ data: iBook[]; total: number }> {
    const skip = (pageNumber - 1) * limitNumber;

    const aggregation: PipelineStage[] = [];

    if (category) {
      aggregation.push({ $match: { category } });
    }
    if (author) {
      aggregation.push({ $match: { author } });
    }
    if (minViews !== undefined || maxViews !== undefined) {
      const viewFilter: any = {};
      if (minViews !== undefined) viewFilter.$gte = minViews;
      if (maxViews !== undefined) viewFilter.$lte = maxViews;
      aggregation.push({ $match: { view: viewFilter } });
    }

    const totalAggregation = [...aggregation, { $count: "total" }];
    const totalResult = await this.bookModel.aggregate(totalAggregation);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    aggregation.push({ $sort: { view: -1 } } as PipelineStage);
    aggregation.push({ $skip: skip } as PipelineStage);
    aggregation.push({ $limit: limitNumber } as PipelineStage);

    const books = await this.bookModel.aggregate(aggregation);

    return { data: books, total };
  }

  async recLetGuest(category: BookCategory, bookId: string): Promise<iBook[]> {
    const books = await this.bookModel.find({
      category: category,
      _id: { $ne: bookId },
      status: { $ne: Status.DELETED },
      deleted_at: null
    })
      .sort({ view: -1 })
      .limit(5)
      .exec();

    return books;
  }

  async bulkUpdateCoverImagesForMissingCover(img: string): Promise<any> {
    const booksWithoutCover = await this.bookModel.find({ img: { $exists: false } });

    if (booksWithoutCover.length === 0) {
      throw new NotFoundException('No books without cover found');
    }

    const bulkOperations = booksWithoutCover.map(book => ({
      updateOne: {
        filter: { _id: book._id },
        update: { $set: { img } },
      }
    }));

    const result = await this.bookModel.bulkWrite(bulkOperations);

    if (result.modifiedCount === 0) {
      throw new NotFoundException('No books were updated');
    }

    return result;
  }

  async updateAllShortDescriptions(shortDescription: string): Promise<any> {
    const result = await this.bookModel.updateMany(
      { status: { $ne: Status.DELETED }, deleted_at: null }, 
      { $set: { short_description: shortDescription } },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('No books were updated');
    }

    return result;
  }

  async findRandomBooksByCategory(category: string, limit: number): Promise<iBook[]> {
    const books = await this.bookModel.aggregate([
      { $match: { category: category, status: { $ne: 'deleted' } } },
      { $sample: { size: limit } },
    ]);
    return books;
  }

  async findPopularBooksByAuthor(author: string, limit: number): Promise<iBook[]> {
    const books = await this.bookModel.find({
      author,
      status: { $ne: 'deleted' },
    })
      .sort({ view: -1 })
      .limit(limit)
      .exec();
    return books;
  }
  
}
