import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Request } from 'express';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // ---------------- Create Comment ----------------
  @Post('/create-comment')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Comment created successfully.' })
  async createOne(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: Request
  ) {
    const comment = await this.commentService.createComment(createCommentDto, req);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  // ---------------- Find Comment ----------------
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

  // ---------------- Update Comment ----------------
  @Patch('/update-comment/:commentId')
  @ApiOperation({ summary: 'Update a comment by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Comment updated successfully.' })
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

  // ---------------- Hard Delete (New) ----------------
  @Delete('/delete-comment/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment by Comment ID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Comment deleted successfully.' })
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentService.deleteComment(commentId);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Comment deleted successfully',
      data: null,
    };
  }

  // ---------------- Create Reply ----------------
  @Post('/create-reply/:commentId')
  @ApiOperation({ summary: 'Reply to a comment' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Reply created successfully.' })
  async createReply(
    @Param('commentId') commentId: string,
    @Body('userId') userId: string,
    @Body('content') content: string
  ) {
    const reply = await this.commentService.createReply(commentId, userId, content);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reply created successfully',
      data: reply,
    };
  }

  // ---------------- Update Reply ----------------
  @Patch('/update-reply/:replyId')
  @ApiOperation({ summary: 'Update a reply' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Reply updated successfully.' })
  async updateReply(
    @Param('replyId') replyId: string,
    @Body('content') content: string,
  ) {
    const reply = await this.commentService.updateReply(replyId, content);
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply updated successfully',
      data: reply,
    };
  }

  // ---------------- Delete Reply ----------------
  @Delete('/delete-reply/:replyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reply' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Reply deleted successfully.' })
  async deleteReply(@Param('replyId') replyId: string) {
    await this.commentService.deleteReply(replyId);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Reply deleted successfully',
      data: null,
    };
  }
}
