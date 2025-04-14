import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';

@Controller('api/comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // ---------- CREATE ----------
  @Post('/create-comment')
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req: any) {
    const comment = await this.commentService.createComment(createCommentDto, req);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  @Post('/reply/:parentCommentId')
  async createReply(@Param('parentCommentId') parentCommentId: string, @Body() createReplyDto: CreateReplyDto, @Req() req: any) {
    const reply = await this.commentService.createReply(parentCommentId, createReplyDto, req);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reply created successfully',
      data: reply,
    };
  }

  // ---------- READ ----------
  @Get('/find-all/:bookId')
  async findAllByBook(@Param('bookId') bookId: string) {
    const comments = await this.commentService.findAllByBookId(bookId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comments fetched successfully',
      data: comments,
    };
  }

  // ---------- UPDATE ----------
  @Patch('/update-comment/:commentId')
  async updateComment(@Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentService.updateComment(commentId, updateCommentDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment updated successfully',
      data: comment,
    };
  }

  @Patch('/update-reply/:replyId')
  async updateReply(@Param('replyId') replyId: string, @Body() updateReplyDto: UpdateReplyDto) {
    const reply = await this.commentService.updateReply(replyId, updateReplyDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply updated successfully',
      data: reply,
    };
  }

  // ---------- DELETE (Hard Delete) ----------
  @Delete('/delete-comment/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentService.deleteComment(commentId);
  }

  @Delete('/delete-reply/:replyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteReply(@Param('replyId') replyId: string) {
    await this.commentService.deleteReply(replyId);
  }
}
