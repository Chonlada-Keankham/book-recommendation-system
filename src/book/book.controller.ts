import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { iBook } from './interface/book.interface';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiTags('Book')
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService

  ) {}

 @Post('/create-one')
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Book created successfully.' })
  async createOne(@Body() createBookDto: CreateBookDto): Promise<{ statusCode: number; message: string; data: iBook }> {
    const createdBook = await this.bookService.createOne(createBookDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Book created successfully',
      data: createdBook,
    };
  }

  @Post('create-many')
  @ApiOperation({ summary: 'Create multiple books' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Books created successfully.' })
  async createMany(@Body() createBookDtos: CreateBookDto[]): Promise<{ statusCode: number; message: string; data: iBook[] }> {
    const createdBooks = await this.bookService.createMany(createBookDtos);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Books created successfully',
      data: createdBooks,
    };
  }

  @Get('find-one/:id')
  @ApiOperation({ summary: 'Find a book by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book found.' })
  async findOneById(@Param('id') id: string): Promise<{ statusCode: number; message: string; data: iBook }> {
    const book = await this.bookService.findOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book found',
      data: book,
    };
  }
  
  @Get('find-all')
  @ApiOperation({ summary: 'Find all books' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Books found.' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10): Promise<{ statusCode: number; message: string; data: iBook[]; total: number }> {
    const result = await this.bookService.findAll(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }

  @Get('/search')
  @ApiOperation({ summary: 'Find all books with filters' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Books found.' })
  async depthSearch(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('minViews') minViews?: string,
    @Query('maxViews') maxViews?: string,
  ): Promise<{ statusCode: number; message: string; data: iBook[]; total: number }> {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const minViewsNumber = minViews !== undefined ? parseInt(minViews, 10) : undefined;
    const maxViewsNumber = maxViews !== undefined ? parseInt(maxViews, 10) : undefined;
  
    const result = await this.bookService.depthSearch(
      category,
      author,
      minViewsNumber,
      maxViewsNumber,
      pageNumber,
      limitNumber
    );
  
    return {
      statusCode: HttpStatus.OK,
      message: 'Books found',
      data: result.data,
      total: result.total,
    };
  }
   
@Get('/updateView/:id')
@ApiOperation({ summary: 'Get a book and update its views' })
@ApiResponse({ status: HttpStatus.OK, description: 'Book retrieved and views updated'})
async getBook(@Param('id') id: string): Promise<{ statusCode: number; message: string; data: iBook }> {
  try {
    const updatedBook = await this.bookService.updateView(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book retrieved and views updated',
      data: updatedBook,
    };
  } catch (error) {
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: error.message,
      data: null,
    };
  }
}

@Get('/recBooksByCate/:id')
@ApiOperation({ summary: 'Automatically recommend books by category' })
@ApiResponse({ status: HttpStatus.OK, description: 'Recommended books fetched successfully.' })
async recommendBooks(
  @Param('id') id: string
): Promise<{ statusCode: number; message: string; data: iBook[] }> {
  const book = await this.bookService.findOneById(id);

  if (!book) {
    throw new NotFoundException('Book not found');
  }

  const recommendedBooks = await this.bookService.recLetGuest(book.category, id);

  return {
    statusCode: HttpStatus.OK,
    message: 'Recommended books fetched successfully',
    data: recommendedBooks,
  };
}

@Get('/view-and-recommend/:id')
  @ApiOperation({ summary: 'Get a book, update its views, and recommend books in the same category' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book retrieved, views updated, and recommendations sent' })
  async viewAndRecommendBook(@Param('id') id: string): Promise<{ statusCode: number; message: string; data: { updatedBook: iBook; recommendedBooks: iBook[] } }> {
    try {
      const updatedBook = await this.bookService.updateView(id);

      const category = updatedBook.category;

      const recommendedBooks = await this.bookService.recLetGuest(category, id);

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
@ApiResponse({ status: HttpStatus.OK, description: 'Book updated successfully.' })
async updateOne(
  @Param('id') id: string,
  @Body() updateBookDto: UpdateBookDto,
  @Body('img') img?: string,  
): Promise<{ statusCode: number; message: string; data: iBook }> {
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

  @Delete('delete-one/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Book deleted successfully.' })
  async deleteById(@Param('id') id: string): Promise<{ statusCode: number; message: string; data: null }> {
    await this.bookService.deleteById(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Book deleted successfully',
      data: null,
    };
  }
  
  @Delete('soft-delete/:id')
  @ApiOperation({ summary: 'Soft delete a book by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book soft deleted successfully.' })
  async softDelete(@Param('id') id: string): Promise<{ statusCode: number; message: string; data: iBook }> {
    const softDeletedBook = await this.bookService.softDelete(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Book soft deleted successfully',
      data: softDeletedBook,
    };
  }

}
