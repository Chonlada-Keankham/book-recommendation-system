import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { iComment } from './interface/comment.interface';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService

  ) { }

  @Post('/create-one')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment created successfully.' })
  async createOne(@Body() createCommentDto: CreateCommentDto): Promise<{ statusCode: number; message: string; data: iComment }> {
    const createdComment = await this.commentService.createOne(createCommentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Created Comment Success',
      data: createdComment,
    };
  }

  @Get('/find-one/:id')
  @ApiOperation({ summary: 'Find a comment by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment found.' })
  async findOneById(@Param('id') id: string) {
    const comment = await this.commentService.findOneById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment found',
      data: comment,
    };
  }

  @Get('/find-all')
  @ApiOperation({ summary: 'Find all comments' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comments found.' })
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const result = await this.commentService.findAll(page, limit);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comments found',
      data: result.comments,
      total: result.total,
    };
  }

  @Put('/updatecomment/:bookId/:userId')
  @ApiOperation({ summary: 'Update a comment by book and user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment updated successfully.' })
  async updateOne(@Param('bookId') bookId: string, @Param('userId') userId: string, @Body() updateCommentDto: UpdateCommentDto) {
    const updatedComment = await this.commentService.updateComment(bookId, userId, updateCommentDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment updated successfully',
      data: updatedComment,
    };
  }

  @Delete('/soft-delete/:bookId/:userId')
  @ApiOperation({ summary: 'Soft delete a comment by book and user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment soft deleted successfully.' })
  async softDelete(@Param('bookId') bookId: string, @Param('userId') userId: string) {
    const softDeletedComment = await this.commentService.softDelete(bookId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment soft deleted successfully',
      data: softDeletedComment,
    };
  }

  @Delete('/delete/:bookId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment by book and user ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Comment deleted successfully.' })
  async deleteOne(@Param('bookId') bookId: string, @Param('userId') userId: string) {
    await this.commentService.deleteById(bookId, userId);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Comment deleted successfully',
      data: null,
    };
  }
}
