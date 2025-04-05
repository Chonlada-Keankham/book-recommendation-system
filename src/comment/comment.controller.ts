import { UserService } from 'src/user/user.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
  ) { }

  // ----------------Create----------
  @Post('/create-comment')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment created successfully.'
  })
  async createOne(@Body() createCommentDto: CreateCommentDto) {
    const comment = await this.commentService.createComment(createCommentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data: comment,
    };
  }

  // ----------------Get----------
  @Get('/find-one/:id')
  @ApiOperation({ summary: 'Find a comment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment found.'
  })
  async findOneById(@Param('id') id: string) {
    const comment = await this.commentService.findOneById(id); 
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment found',
      data: comment,
    };
  }
  
  // ----------------Update----------
  @Patch('/update-comment/:commentId')
  @ApiOperation({ summary: 'Update a comment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment updated successfully.'
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentService.updateComment(commentId, updateCommentDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment updated successfully',
      data: comment,
    };
  }

  // ----------------Delete----------
  @Delete('/soft-delete/:bookId/:userId')
  @ApiOperation({ summary: 'Soft delete a comment by book ID and user ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment soft deleted successfully.'
  })
  async softDelete(
    @Param('bookId') bookId: string,
    @Param('userId') userId: string) {
    const comment = await this.commentService.softDelete(bookId, userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment soft deleted successfully',
      data: comment,
    };
  }

  @Delete('/delete/:bookId/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment by book ID and user ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Comment deleted successfully.'
  })
  async deleteOne(
    @Param('bookId') bookId: string,
    @Param('userId') userId: string) {
    await this.commentService.deleteById(bookId, userId);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Comment deleted successfully',
      data: null,
    };
  }
}
