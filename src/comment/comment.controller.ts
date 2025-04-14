import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';
import { CreateReplyDto } from './dto/reply-comment.dto';

@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // ---------- Create Comment ----------
  @Post()
  async createComment(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    const userId = req.user.id;
    return this.commentService.createComment(createCommentDto, userId);
  }

  // ---------- Update Comment ----------
  @Patch('/:commentId')
  async updateComment(@Param('commentId') commentId: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req) {
    const userId = req.user.id;
    return this.commentService.updateComment(commentId, updateCommentDto, userId);
  }

  // ---------- Delete Comment ----------
  @Delete('/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Req() req) {
    const userId = req.user.id;
    return this.commentService.deleteComment(commentId, userId);
  }

  // ---------- Create Reply ----------
  @Post('/:commentId/reply')
  async createReply(@Param('commentId') commentId: string, @Body() createReplyDto: CreateReplyDto, @Req() req) {
    const userId = req.user.id;
    return this.commentService.createReply(commentId, createReplyDto, userId);
  }

  // ---------- Update Reply ----------
  @Patch('/:commentId/reply/:replyId')
  async updateReply(
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Body() updateReplyDto: UpdateReplyDto,
    @Req() req
  ) {
    const userId = req.user.id;
    return this.commentService.updateReply(commentId, replyId, updateReplyDto, userId);
  }

  // ---------- Delete Reply ----------
  @Delete('/:commentId/reply/:replyId')
  async deleteReply(@Param('commentId') commentId: string, @Param('replyId') replyId: string, @Req() req) {
    const userId = req.user.id;
    return this.commentService.deleteReply(commentId, replyId, userId);
  }

  // ---------- Find Comments of a Book ----------
  @Get('/book/:bookId')
  async findCommentsByBook(@Param('bookId') bookId: string) {
    return this.commentService.findCommentsByBook(bookId);
  }
}
