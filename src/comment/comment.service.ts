import {Injectable, NotFoundException } from '@nestjs/common';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Status } from 'src/enum/status.enum';
import { UserService } from 'src/user/user.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BookService } from 'src/book/book.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) { }

  async createOne(createCommentDto: CreateCommentDto): Promise<iComment> {
    const existingBook = await this.bookService.findOneById(createCommentDto.book.toString());
    if (!existingBook) {
      throw new Error('Book does not exist.');
    }

    const userExists = await this.userService.findOneById(createCommentDto.user.toString());
    if (!userExists) {
      throw new Error('User does not exist.');
    }

    const newComment = new this.commentModel({
      ...createCommentDto,
      deleted_at: null,
    });

    return await newComment.save();
  }

  async findOneById(id: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      _id: id,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found or has been deleted.`);
    }

    return comment;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ comments: iComment[], total: number }> {
    const skip = (page - 1) * limit;
  
    const total = await this.commentModel.countDocuments({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    const comments = await this.commentModel.find(
      { status: { $ne: Status.DELETED }, deleted_at: null },
    )
      .skip(skip) 
      .limit(limit) 
      .exec();
  
    return { comments, total };
  }
  
  async updateComment(bookId: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      'book': bookId,
      'users.user': userId,
      'status': { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
  
    const userCommentIndex = comment.users.findIndex(user => user.user.toString() === userId);
  
    if (userCommentIndex === -1) {
      throw new NotFoundException('User comment not found.');
    }
  
    comment.users[userCommentIndex].comments.forEach((userComment) => {
      userComment.content = updateCommentDto.content;
      userComment.updated_at = new Date();
    });
  
    await comment.save();
  
    return comment;
  }
    
  async softDelete(bookId: string, userId: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      'book': bookId,
      'users.user': userId,
      'status': { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
  
    comment.deleted_at = new Date();
  
    return await comment.save();
  }
  
  async deleteById(bookId: string, userId: string): Promise<boolean> {
    const comment = await this.commentModel.findOne({
      'book': bookId,
      'users.user': userId,
    });
  
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
  
    await this.commentModel.deleteOne({
      'book': bookId,
      'users.user': userId,
    });
  
    return true;
  }
  
}
