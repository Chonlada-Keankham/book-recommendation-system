import { BookCategory } from 'src/enum/book-category.enum';
import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { iBook } from './interface/book.interface';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService

  ) { }

  @Post('/create-one')
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully.'
  })
  async createOne(@Body() createBookDto: CreateBookDto) {
    const book = await this.bookService.createOne(createBookDto);
    return {
      statusCode: 201,
      message: 'Book created successfully',
      data: book,
    };
  }

  @Post('/create-many')
  @ApiOperation({ summary: 'Create multiple books' })
  @ApiResponse({
    status: 201,
    description: 'Books created successfully.'
  })
  async createMany(@Body() createBookDtos: CreateBookDto[]) {
    const books = await this.bookService.createMany(createBookDtos);
    return {
      statusCode: 201,
      message: 'Books created successfully',
      data: books,
    };
  }

  @Get('/find-one/:id')
  @ApiOperation({ summary: 'Find a book by ID' })
  async findOneById(@Param('id') id: string) {
    const book = await this.bookService.findOneById(id);
    return {
      statusCode: 200,
      message: 'Book found',
      data: book,
    };
  }

  @Get('/find-all')
  @ApiOperation({ summary: 'Find all books' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.bookService.findAll(page, limit);
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/depth-search')
  @ApiOperation({ summary: 'Search books with filters' })
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
      parseInt(limit)
    );
    return {
      statusCode: 200,
      message: 'Books found',
      data: result.data,
      total: result.total,
    };
  }

  @Get('/updateView/:id')
  @ApiOperation({ summary: 'Increase view count of a book' })
  async updateView(@Param('id') id: string) {
    const updatedBook = await this.bookService.updateView(id);
    return {
      statusCode: 200,
      message: 'View updated successfully',
      data: updatedBook,
    };
  }

  @Get('/recommend/guest')
  @ApiOperation({ summary: 'Recommend books for guest' })
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
  @ApiOperation({ summary: 'Recommend books for member' })
  async recommendForMember(@Query('userId') userId: string, @Query('bookId') bookId: string) {
    const books = await this.bookService.recommendBooksForMember(userId, bookId);
    return {
      statusCode: 200,
      message: 'Recommended books for member',
      data: books,
    };
  }

  @Get('/view-and-recommend/:id')
  @ApiOperation({ summary: 'Get a book, update its views, and recommend books in the same category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book retrieved, views updated, and recommendations sent'
  })
  async viewAndRecommendBook(@Param('id') id: string): Promise<{
    statusCode: number;
    message: string;
    data: {
      updatedBook: iBook;
      recommendedBooks: iBook[]
    }
  }> {
    try {
      const updatedBook = await this.bookService.updateView(id);

      const category = updatedBook.category;

      const recommendedBooks = await this.bookService.recommendBooksForGuest(category, id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Book retrieved, views updated, and recommendations sent',
        data: {
          updatedBook,
          recommendedBooks,
        },
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: null,
      };
    }
  }

  @Put('update-one/:id')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book updated successfully.'
  })
  async updateOne(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
    @Body('img') img?: string,
  ): Promise<{
    statusCode: number;
    message: string;
    data: iBook
  }> {
    let updatedBook: iBook;

    if (img) {
      updatedBook = await this.bookService.updateCoverImage(id, img);
    } else {
      updatedBook = await this.bookService.updateOne(id, updateBookDto);
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Book updated successfully',
      data: updatedBook,
    };
  }

  @Delete('/delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Book deleted successfully.'
  })
  async deleteById(@Param('id') id: string) {
    await this.bookService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Book deleted successfully',
      data: null
    };
  }

  @Delete('/soft-delete/:id')
  @ApiOperation({ summary: 'Soft delete a book by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Book soft deleted successfully.'
  })
  async softDelete(@Param('id') id: string) {
    const book = await this.bookService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book soft deleted successfully',
      data: book
    };
  }

  @Put('/update-cover-for-missing')
  @ApiOperation({ summary: 'Update cover for books without image' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Covers updated successfully.'
  })
  async bulkUpdateCoverForMissing(@Body('img') img: string) {
    const result = await this.bookService.bulkUpdateCoverImagesForMissingCover(img);
    return {
      statusCode: HttpStatus.OK,
      message: 'Covers updated successfully',
      data: result
    };
  }

  @Put('/update-all-short-description')
  @ApiOperation({ summary: 'Bulk update short description' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Descriptions updated successfully.'
  })
  async updateAllShortDescriptions(@Body('short_description') shortDescription: string) {
    const result = await this.bookService.updateAllShortDescriptions(shortDescription);
    return {
      statusCode: HttpStatus.OK,
      message: 'Descriptions updated successfully',
      data: result
    };
  }

  @Get('/random')
  @ApiOperation({ summary: 'Get random books by category' })
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
  @ApiOperation({ summary: 'Get popular books by author' })
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

