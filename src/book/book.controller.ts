import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBookDto } from './dto/create-book.dto';
import { iBook } from './interface/book.interface';
import { UpdateBookDto } from './dto/update-book.dto';
@Controller('book')
export class BookController {
  constructor(private readonly bookService: BookService

  ) {}

 @Post('create-one')
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
  async searchBooks(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: string,
    @Query('author') author?: string,
    @Query('minViews') minViews?: number,
    @Query('maxViews') maxViews?: number,
  ): Promise<{ statusCode: number; message: string; data: iBook[]; total: number }> {
    const pageNumber = parseInt(page as any, 10);
    const limitNumber = parseInt(limit as any, 10);
    
    const result = await this.bookService.searchBooks(
      category ? category : undefined, 
      author ? author : undefined, 
      minViews, 
      maxViews, 
      pageNumber, 
      limitNumber
    );
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Books found',
      data: result.books,
      total: result.total,
    };
  }
        
  @Put('update-one/:id')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book updated successfully.' })
  async updateOne(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto): Promise<{ statusCode: number; message: string; data: iBook }> {
    const updatedBook = await this.bookService.updateOne(id, updateBookDto);
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
