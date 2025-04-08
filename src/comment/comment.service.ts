import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserService } from 'src/user/user.service';
import { BookService } from 'src/book/book.service';
import { Status } from 'src/enum/status.enum';
import { request } from 'express';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) { }

  // -------------------------------------------------------------------
  // 🔸 CREATE
  // -------------------------------------------------------------------
  async createComment(createCommentDto: CreateCommentDto): Promise<iComment> {
    try {
      const user = await this.userService.findOneById(createCommentDto.user.toString());
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const ip = request.headers['x-forwarded-for'] || request.ip;
      const book = await this.bookService.findOneById(createCommentDto.book.toString(), request.ip);
      if (!book) throw new HttpException('Book not found', HttpStatus.NOT_FOUND);

      // ตรวจสอบคอมเมนต์ที่มีอยู่แล้วสำหรับหนังสือและผู้ใช้
      const existingComment = await this.commentModel.findOne({ book: createCommentDto.book });

      if (existingComment) {
        const userComments = existingComment.users.find(
          u => u.user.toString() === createCommentDto.user.toString()
        );

        if (userComments) {
          const existingUserComment = userComments.comments.find(
            comment => comment.content === createCommentDto.content
          );

          if (!existingUserComment) {
            userComments.comments.push({
              _id: new Types.ObjectId(),
              content: createCommentDto.content,
              created_at: new Date(),
              updated_at: new Date(),
            });
          } else {
            throw new HttpException('Duplicate comment found', HttpStatus.BAD_REQUEST);
          }
        } else {
          existingComment.users.push({
            user: createCommentDto.user,
            comments: [
              {
                _id: new Types.ObjectId(),
                content: createCommentDto.content,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          });
        }

        await existingComment.save();
        return existingComment;
      }

      const newComment = new this.commentModel({
        book: createCommentDto.book,
        status: Status.ACTIVE,
        deleted_at: null,
        users: [
          {
            user: createCommentDto.user,
            comments: [
              {
                _id: new Types.ObjectId(),
                content: createCommentDto.content,
                created_at: new Date(),
                updated_at: new Date(),
              },
            ],
          },
        ],
      });

      return await newComment.save();
    } catch (error) {
      console.error(error);
      throw new HttpException('Failed to create comment.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // -------------------------------------------------------------------
  // 🔸 READ
  // -------------------------------------------------------------------
  async findOneById(id: string): Promise<any> {
    try {
      const comment = await this.commentModel.findOne({
        'users.comments._id': new Types.ObjectId(id),
      }).populate('users.user') //
        .exec();

      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      const userComment = comment.users
        .map(user => user.comments.find(c => c._id.toString() === id))
        .find(c => c !== undefined);

      if (!userComment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }

      return userComment;
    } catch (error) {
      throw new HttpException('Failed to find comment.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE
  // -------------------------------------------------------------------
  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto): Promise<iComment> {
    try {
      const { content, user, book } = updateCommentDto;

      const existingComment = await this.commentModel.findOne({
        book: book,
        'users.user': user,
      });

      if (!existingComment) throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);

      const userComments = existingComment.users.find(u => u.user.toString() === user.toString());
      if (!userComments) throw new HttpException('User has not commented on this book', HttpStatus.NOT_FOUND);

      const commentIndex = userComments.comments.findIndex(
        comment => comment._id.toString() === commentId.toString()
      );

      if (commentIndex === -1) throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);

      userComments.comments[commentIndex].content = content;
      userComments.comments[commentIndex].updated_at = new Date();

      await existingComment.save();
      return existingComment;
    } catch (error) {
      throw new HttpException('Failed to update comment.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE
  // -------------------------------------------------------------------

  async softDelete(
    bookId: string,
    userId: string): Promise<iComment> {
    try {
      const user = await this.userService.findOneById(userId);
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const comment = await this.commentModel.findOne({
        book: bookId,
        'users.user': userId,
        status: { $ne: Status.DELETED },
        deleted_at: null,
      });

      if (!comment) throw new NotFoundException('Comment not found or already deleted.');

      comment.deleted_at = new Date();
      await comment.save();
      return comment;
    } catch (error) {
      throw new HttpException('Failed to soft delete comment.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteById(
    bookId: string,
    userId: string): Promise<boolean> {
    try {
      const user = await this.userService.findOneById(userId);
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const comment = await this.commentModel.findOne({
        book: bookId,
        'users.user': userId,
      });

      if (!comment) throw new NotFoundException('Comment not found.');

      await this.commentModel.deleteOne({
        book: bookId,
        'users.user': userId,
      });

      return true;
    } catch (error) {
      throw new HttpException('Failed to delete comment.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
