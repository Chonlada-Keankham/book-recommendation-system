import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 🔸 CREATE
  @Post('/create')
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentService.createComment(createCommentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  // 🔸 READ
  @Get('/find-one/:commentId')
  async findComment(@Param('commentId') commentId: string) {
    const comment = await this.commentService.findCommentById(commentId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment found',
      data: comment,
    };
  }

  @Get('/find-all/:bookId')
  async findCommentsByBookId(@Param('bookId') bookId: string) {
    const comments = await this.commentService.findCommentsByBookId(bookId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comments found',
      data: comments,
    };
  }

  // 🔸 UPDATE
  @Put('/update/:commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto
  ) {
    const comment = await this.commentService.updateComment(commentId, updateCommentDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment updated successfully',
      data: comment,
    };
  }

  // 🔸 DELETE
  @Delete('/delete/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentService.deleteComment(commentId);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Comment deleted successfully',
      data: null,
    };
  }
}
