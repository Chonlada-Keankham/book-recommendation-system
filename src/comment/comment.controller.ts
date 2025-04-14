import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  // ---------- Create Comment ----------
  @UseGuards(JwtAuthGuard)
  @Post('/create-comment')
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req: Request) {
    const userId = req.user['_id'];
    const comment = await this.commentService.createComment(createCommentDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  // ---------- Update Comment ----------
  @UseGuards(JwtAuthGuard)
  @Patch('update/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment updated successfully.' })
  async updateComment(@Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req: Request) {
    const userId = req.user['_id'];
    const comment = await this.commentService.updateComment(commentId, updateCommentDto, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment updated successfully',
      data: comment,
    };
  }

  // ---------- Delete Comment ----------
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment deleted successfully.' })
  async deleteComment(@Param('commentId') commentId: string, @Req() req: Request) {
    const userId = req.user['_id'];
    await this.commentService.deleteComment(commentId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment deleted successfully',
      data: null,
    };
  }

  // ---------- Create Reply ----------
  @UseGuards(JwtAuthGuard)
  @Post('/:commentId/reply')
  @ApiOperation({ summary: 'Reply to a comment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Reply created successfully.' })
  async createReply(@Param('commentId') commentId: string, @Body() createReplyDto: CreateReplyDto, @Req() req: Request) {
    const userId = req.user['_id'];
    const reply = await this.commentService.createReply(commentId, createReplyDto, userId);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reply created successfully',
      data: reply,
    };
  }

  // ---------- Update Reply ----------

  @UseGuards(JwtAuthGuard)
  @Patch('/:commentId/reply/:replyId')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reply updated successfully.' })
  async updateReply(
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @Req() req: Request
  ) {
    const userId = req.user['_id'];
    const reply = await this.commentService.updateReply(commentId, replyId, updateReplyDto, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply updated successfully',
      data: reply,
    };
  }

  // ---------- Delete Reply ----------
  @UseGuards(JwtAuthGuard)
  @Delete('/:commentId/del/:replyId')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reply deleted successfully.' })
  async deleteReply(@Param('commentId') commentId: string, @Param('replyId') replyId: string, @Req() req: Request) {
    const userId = req.user['_id'];
    await this.commentService.deleteReply(commentId, replyId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply deleted successfully',
      data: null,
    };
  }

  // ---------- Find Comments of a Book ----------
  @Get('/book/:bookId')
  @ApiOperation({ summary: 'Find all comments by book ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comments fetched successfully.' })
  async findCommentsByBook(@Param('bookId') bookId: string) {
    const comments = await this.commentService.findCommentsByBook(bookId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comments fetched successfully',
      data: comments,
    };
  }
}
