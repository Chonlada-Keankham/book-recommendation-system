import { extname } from 'path';
import { BookCategory } from 'src/enum/book-category.enum';
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';
import { Request } from 'express';

@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) { }

  // ----------------Create----------
  @Post('/create')
  async createBook(@Body() createBookDto: CreateBookDto, @UploadedFile() file: Express.Multer.File) {
    const book = await this.bookService.createBook(createBookDto, file.filename);
    return {
      statusCode: 201,
      message: 'Book created successfully',
      data: book,
    };
  }

  @Get('/find-one/:id')
  async getBook(@Param('id') id: string, @Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;

    const book = await this.bookService.findOneByIdAndUpdateView(id, ip);

    return {
      statusCode: 200,
      message: 'Book found',
      book: book,
    };
  }

  @Get('/find-all')
  async findAll(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;

    const books = await this.bookService.findAll(ip);
    return {
      statusCode: 200,
      message: 'Books found',
      books: books,
    };
  }

  @Get('/novel')
  async getNovelBooks(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;
  
    const result = await this.bookService.findNovelBooks(ip);  // ฟังก์ชันสำหรับหมวด Novel
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }
  
  @Get('/travel')
  async getTravelBooks(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;
  
    const result = await this.bookService.findTravelBooks(ip);  // ฟังก์ชันสำหรับหมวด Travel
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }
  
  @Get('/business')
  async getBusinessBooks(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;
  
    const result = await this.bookService.findBusinessBooks(ip);  // ฟังก์ชันสำหรับหมวด Business
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }
  
  @Get('/sport')
  async getSportBooks(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;
  
    const result = await this.bookService.findSportBooks(ip);  // ฟังก์ชันสำหรับหมวด Sport
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }
  
  @Get('/education')
  async getEducationBooks(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;
  
    const result = await this.bookService.findEducationBooks(ip);  // ฟังก์ชันสำหรับหมวด Education
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }
  
  // ---------- Recommendation ----------
  @Get('/recommend/guest')
  async recommendForGuest(
    @Query('category') category: string,
    @Query('bookId') bookId: string,
  ) {
    if (!Object.values(BookCategory).includes(category as BookCategory)) {
      throw new BadRequestException('Invalid category');
    }


    const categoryEnum = category as BookCategory;

    const books = await this.bookService.recommendBooksForGuest(
      categoryEnum,
      bookId,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Recommended books found',
      data: books,
    };
  }

  @Get('/recommend/member')
  async recommendForMember(
    @Query('userId') userId: string,
    @Query('bookId') bookId: string,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid book ID');
    }

    const recommendedBooks = await this.bookService.recommendBooksForMember(userId, bookId);

    return {
      statusCode: HttpStatus.OK,
      message: 'Recommended books for member retrieved successfully.',
      data: recommendedBooks,
    };
  }

  @Get('/random')
  async getRandomBooks(
    @Query('category') category: string,
    @Query('limit') limit = '10'
  ) {
    const books = await this.bookService.findRandomBooksByCategory(category);
    return {
      statusCode: HttpStatus.OK,
      message: 'Random books fetched successfully',
      data: books,
    };
  }

  @Get('/popular')
  async getPopularBooks(
    @Query('author') author: string,
    @Query('limit') limit = '10'
  ) {
    const books = await this.bookService.findPopularBooksByAuthor(author);
    return {
      statusCode: HttpStatus.OK,
      message: 'Popular books fetched successfully',
      data: books,
    };
  }

  // ----------------Update----------
  @Put('/update-all-short-description')
  async updateAllShortDescriptions(@Body('short_description') shortDescription: string) {
    const result = await this.bookService.updateAllShortDescriptions(shortDescription);
    return {
      statusCode: HttpStatus.OK,
      message: 'Descriptions updated successfully',
      data: result
    };
  }

  // ---------- Upload ----------
  @Put('/upload-cover/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/book',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  @ApiOperation({ summary: 'Upload book cover image' })
  async uploadBookCover(
    @Param('id') bookId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const book = await this.bookService.uploadBookCover(bookId, file.filename);
    return {
      statusCode: 200,
      message: 'Book cover uploaded successfully',
      data: book,
    };
  }

  // ---------- Delete ----------
  @Delete('/delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteById(@Param('id') id: string) {
    await this.bookService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Book deleted successfully',
      data: null
    };
  }

  @Delete('/soft-delete/:id')
  async softDelete(@Param('id') id: string) {
    const book = await this.bookService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book soft deleted successfully',
      data: book
    };
  }

  //-----------------------------------
  @Put('/update-cover-by-category')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/book',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      }
    })
  }))
  async updateBookCoverByCategory(
    @Query('category') category: string,  // ใช้ @Query แทน @Body
    @UploadedFile() file: Express.Multer.File  // รับไฟล์ภาพจาก form-data
  ) {
    const updatedBooks = await this.bookService.updateBookCoverByCategory(category, file.filename);

    return {
      statusCode: 200,
      message: 'Book covers updated successfully',
      data: updatedBooks,
    };
  }
}
