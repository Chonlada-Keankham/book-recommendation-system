import { extname } from 'path';
import { BookCategory } from 'src/enum/book-category.enum';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express'; 

@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) { }

  // ----------------Create----------
  @Post('/create')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/book',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  async createBook(
    @Body() createBookDto: CreateBookDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const book = await this.bookService.createBook(createBookDto, file);
    return {
      statusCode: 201,
      message: 'Book created successfully',
      data: book,
    };
  }
  // ----------------Read----------
  @Get('/find-one/:id')
  async findBookById(
    @Param('id') id: string,
    @Req() req: Request  
  ) {
    const book = await this.bookService.findOneByIdAndUpdateView(id, req);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book found',
      book: book,
    };
  }
  
  @Get('/find-all')
  async findAll(@Req() request: Request) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;

    const books = await this.bookService.findAll();
    return {
      statusCode: 200,
      message: 'Books found',
      books: books,
    };
  }

  @Get('/novel')
  async getNovelBooks() {
    const result = await this.bookService.findNovelBooks();
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/travel')
  async getTravelBooks() {
    const result = await this.bookService.findTravelBooks();
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/business')
  async getBusinessBooks() {
    const result = await this.bookService.findBusinessBooks();
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/sport')
  async getSportBooks() {
    const result = await this.bookService.findSportBooks();
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/education')
  async getEducationBooks() {
    const result = await this.bookService.findEducationBooks();
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
    @Req() req: Request
  ) {
    const ip = typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'] : req.ip;

    const { currentBook, recommendedBooks } = await this.bookService.recommendBooksForGuest(
      category as BookCategory,
      bookId,
      ip
    );

    return {
      statusCode: 200,
      message: 'Recommended books for guest',
      data: { book: currentBook, recommendedBooks },
    };
  }

  @Get('/recommend/member')
  async recommendForMember(
    @Query('userId') userId: string,
    @Query('bookId') bookId: string,
    @Req() req: Request
  ) {
    let ip: string;
    const forwarded = req.headers['x-forwarded-for'];
  
    if (typeof forwarded === 'string') {
      ip = forwarded.split(',')[0].trim(); // ✅ ปลอดภัยขึ้น
    } else if (Array.isArray(forwarded)) {
      ip = forwarded[0];
    } else {
      ip = req.ip;
    }
  
    const { currentBook, recommendedBooks } = await this.bookService.recommendBooksForMember(userId, bookId, ip);
  
    return {
      statusCode: 200,
      message: 'Recommended books for member',
      data: { book: currentBook, recommendedBooks },
    };
  }
  
  @Get('/recommendations/daily')
  async getDailyRecommendations(
    @Query('limit') limit = '10'
  ) {
    const books = await this.bookService.getDailyRecommendedBooks();

    return {
      statusCode: HttpStatus.OK,
      message: 'Daily recommended books fetched successfully',
      date: new Date().toISOString().slice(0, 10),
      total: books.length,
      data: books,
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

  // ---------- Increase View by API (NEW) ----------
  @Post('/increase-view/:id')
  async increaseView(
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const ip = typeof request.headers['x-forwarded-for'] === 'string'
      ? request.headers['x-forwarded-for']
      : request.ip;

    const book = await this.bookService.increaseViewAfterDelay(id, ip);

    return {
      statusCode: HttpStatus.OK,
      message: 'View increased successfully',
      data: book,
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
    @Query('category') category: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const updatedBooks = await this.bookService.updateBookCoverByCategory(category, file.filename);

    return {
      statusCode: 200,
      message: 'Book covers updated successfully',
      data: updatedBooks,
    };
  }
}
