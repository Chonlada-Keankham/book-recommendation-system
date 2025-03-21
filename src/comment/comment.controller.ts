import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { iComment } from './interface/comment.interface';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService

  ) {}

  @Post('/create-one')
  @ApiOperation({ summary: 'Create a new comment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'This user has already commented on this book.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or book not found.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Failed to create comment. Please try again later.',
  })
  async createOne(@Body() createCommentDto: CreateCommentDto): Promise<{ statusCode: number; message: string; data: iComment }> {
    const createdComment = await this.commentService.createOne(createCommentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Comment created successfully',
      data: createdComment,
    };
  }

  @Get('/find-all')
  @ApiOperation({ summary: 'Get all comments with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of comments.',
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<{ comments: iComment[]; total: number }> {
    return this.commentService.findAll(page, limit);
  }

  @Get('/find-one/:id')
  @ApiOperation({ summary: 'Get a comment by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found.',
  })
  async findOne(@Param('id') id: string): Promise<iComment> {
    return this.commentService.findOneById(id);
  }

  @Patch('/update-one/:id/:index')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment or comment item not found.',
  })
  async updateOne(
    @Param('id') commentId: string,
    @Param('index') index: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<iComment> {
    return this.commentService.updateOne(commentId, updateCommentDto, index);
  }
  
  @Delete('soft-delete/:id/:index')
  @ApiOperation({ summary: 'Soft delete a comment item' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment item soft deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment or comment item not found.',
  })
  async softDelete(
    @Param('id') commentId: string,
    @Param('index') index: number,
  ): Promise<iComment> {
    return this.commentService.softDelete(commentId, index);
  }

  @Delete('/delete-one/:id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Comment not found.',
  })
  async deleteById(@Param('id') commentId: string): Promise<{ statusCode: number; message: string }> {
    await this.commentService.deleteById(commentId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Comment deleted successfully',
    };
  }
}
