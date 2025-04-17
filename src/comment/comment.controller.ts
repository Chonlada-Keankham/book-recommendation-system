import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentService } from './comment.service';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }


  @Get('/book/:bookId')
  @ApiOperation({ summary: 'List comments by book' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comments fetched' })
  async findByBook(@Param('bookId') bookId: string) {
    const comments = await this.commentService.findCommentsByBook(bookId);
    return { statusCode: HttpStatus.OK, data: comments };
  }

  // ---------- Create Comment ----------
  @UseGuards(JwtAuthGuard)
  @Post('/create-comment')
  @ApiOperation({ summary: 'Create a comment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment created' })
  async create(
    @Body() dto: CreateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'];
    const comment = await this.commentService.createComment(dto, userId);
    return { statusCode: HttpStatus.CREATED, data: comment };
  }


  @UseGuards(JwtAuthGuard)
  @Patch('/update/:commentId')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment updated' })
  async update(
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'];
    const updated = await this.commentService.updateComment(commentId, dto, userId);
    return { statusCode: HttpStatus.OK, data: updated };
  }
  
  @UseGuards(JwtAuthGuard)
  @Delete('/delete/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment deleted' })
  async remove(
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'];
    await this.commentService.deleteComment(commentId, userId);
    return { statusCode: HttpStatus.OK };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':commentId/reply')
  @ApiOperation({ summary: 'Reply to a comment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Reply created' })
  async reply(
    @Param('commentId') commentId: string,
    @Body() dto: CreateReplyDto,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'];
    const comment = await this.commentService.createReply(commentId, dto, userId);
    return { statusCode: HttpStatus.CREATED, data: comment };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':commentId/reply/:replyId')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reply updated' })
  async updateReply(
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Body() dto: UpdateReplyDto,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'];
    const comment = await this.commentService.updateReply(commentId, replyId, dto, userId);
    return { statusCode: HttpStatus.OK, data: comment };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':commentId/del/:replyId')
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reply deleted' })
  async removeReply(
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Req() req: Request,
  ) {
    const userId = req.user['_id'];
    await this.commentService.deleteReply(commentId, replyId, userId);
    return { statusCode: HttpStatus.OK };
  }

}
