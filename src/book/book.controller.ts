import { extname } from 'path';
import { BookCategory } from 'src/enum/book-category.enum';
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService) { }

  // -------------------------------------------------------------------
  // 🔸 CREATE
  // -------------------------------------------------------------------

  @Post('/create-one')
  async createOne(@Body() createBookDto: CreateBookDto) {
    const book = await this.bookService.createOne(createBookDto);
    return {
      statusCode: 201,
      message: 'Book created successfully',
      data: book,
    };
  }

  @Post('/create-many')
  async createMany(@Body() createBookDtos: CreateBookDto[]) {
    const books = await this.bookService.createMany(createBookDtos);
    return {
      statusCode: 201,
      message: 'Books created successfully',
      data: books,
    };
  }

  // -------------------------------------------------------------------
  // 🔸 READ
  // -------------------------------------------------------------------

  @Get('/find-one/:id')
  async findOneById(@Param('id') id: string) {
    const book = await this.bookService.findOneById(id);
    return {
      statusCode: 200,
      message: 'Book found',
      data: book,
    };
  }

  @Get('/view-book/:id')
  @ApiOperation({ summary: 'Get book by ID and increase view count' })
  async getBookUpdateView(@Param('id') id: string) {
    const book = await this.bookService.getBookUpdateView(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book retrieved and view count updated successfully',
      data: book,
    };
  }  

  @Get('/find-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10) {
    const result = await this.bookService.findAll(page, limit);
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/depth-search')
  async depthSearch(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('minViews') minViews?: string,
    @Query('maxViews') maxViews?: string,
  ) {
    const result = await this.bookService.depthSearch(
      category,
      author,
      minViews ? parseInt(minViews) : undefined,
      maxViews ? parseInt(maxViews) : undefined,
      parseInt(page),
      parseInt(limit),
    );
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.data,
      total: result.total,
    };
  }

  @Get('/updateView/:id')
  async updateView(@Param('id') id: string) {
    const updatedBook = await this.bookService.updateView(id);
    return {
      statusCode: 200,
      message: 'View updated successfully',
      data: updatedBook,
    };
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE
  // -------------------------------------------------------------------

  @Put('/update-one/:id')
  async updateOne(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto
  ) {
    const updatedBook = await this.bookService.updateOne(id, updateBookDto);
  
    return {
      statusCode: HttpStatus.OK,
      message: 'Book updated successfully',
      data: updatedBook,
    };
  }
  
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

  @Put('/update-cover-for-missing')
  async bulkUpdateCoverForMissing(@Body('img') img: string) {
    const result = await this.bookService.bulkUpdateCoverImagesForMissingCover(img);
    return {
      statusCode: HttpStatus.OK,
      message: 'Covers updated successfully',
      data: result
    };
  }

  @Put('/update-all-short-description')
  async updateAllShortDescriptions(@Body('short_description') shortDescription: string) {
    const result = await this.bookService.updateAllShortDescriptions(shortDescription);
    return {
      statusCode: HttpStatus.OK,
      message: 'Descriptions updated successfully',
      data: result
    };
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE
  // -------------------------------------------------------------------

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

  // -------------------------------------------------------------------
  // 🔸 RECOMMENDATION
  // -------------------------------------------------------------------

  @Get('/recommend/guest')
  async recommendForGuest(
    @Query('category') category: string,
    @Query('exclude') bookId: string,
  ) {
    if (!Object.values(BookCategory).includes(category as BookCategory)) {
      throw new BadRequestException('Invalid category');
    }

    const books = await this.bookService.recommendBooksForGuest(category as BookCategory, bookId);
    return {
      statusCode: 200,
      message: 'Recommended books for guest',
      data: books,
    };
  }

  @Get('/recommend/member')
  async recommendForMember(
    @Query('userId') userId: string,
    @Query('bookId') bookId: string) {
    const books = await this.bookService.recommendBooksForMember(userId, bookId);
    return {
      statusCode: 200,
      message: 'Recommended books for member',
      data: books,
    };
  }

  @Get('/view-and-recommend/:id')
  async viewAndRecommendBook(@Param('id') id: string) {
    try {
      const updatedBook = await this.bookService.updateView(id);
      const recommendedBooks = await this.bookService.recommendBooksForGuest(updatedBook.category, id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Book retrieved, views updated, and recommendations sent',
        data: { updatedBook, recommendedBooks },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  @Get('/random')
  async getRandomBooks(
    @Query('category') category: string,
    @Query('limit') limit = '3') {
    const books = await this.bookService.findRandomBooksByCategory(category, parseInt(limit));
    return {
      statusCode: HttpStatus.OK,
      message: 'Random books fetched successfully',
      data: books
    };
  }

  @Get('/popular')
  async getPopularBooks(
    @Query('author') author: string,
    @Query('limit') limit = '3') {
    const books = await this.bookService.findPopularBooksByAuthor(author, parseInt(limit));
    return {
      statusCode: HttpStatus.OK,
      message: 'Popular books fetched successfully',
      data: books
    };
  }
}
