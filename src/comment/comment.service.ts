import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Status } from 'src/enum/status.enum';
import { UserService } from 'src/user/user.service';
import { Model, Types } from 'mongoose';
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


  async createComment(createCommentDto: CreateCommentDto): Promise<iComment> {
    try {
      const user = await this.userService.findOneById(createCommentDto.user.toString());
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      const book = await this.bookService.findOneById(createCommentDto.book.toString());
      if (!book) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
  
      const existingComment = await this.commentModel.findOne({ book: createCommentDto.book });
  
      if (existingComment) {
        const userComments = existingComment.users.find(u => u.user.toString() === createCommentDto.user.toString());
  
        if (userComments) {
          userComments.comments.push({
            _id: new Types.ObjectId(),  
            content: createCommentDto.content,
            created_at: new Date(),
            updated_at: new Date(),
          });
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
      } else {
        const newComment = {
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
        };
  
        const comment = new this.commentModel(newComment);
        await comment.save();
  
        return comment;
      }
    } catch (error) {
      throw new HttpException(
        'Failed to create comment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto): Promise<iComment> {
    try {
      const { content, user, book } = updateCommentDto;
  
      const existingComment = await this.commentModel.findOne({
        book: book,
        'users.user': user,
      });
  
      if (!existingComment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
  
      const userComments = existingComment.users.find(u => u.user.toString() === user.toString());
  
      if (!userComments) {
        throw new HttpException('User has not commented on this book', HttpStatus.NOT_FOUND);
      }
  
      const commentIndex = userComments.comments.findIndex(
        comment => comment._id.toString() === commentId.toString()  // ใช้ commentId ที่ได้รับ
      );
      
      if (commentIndex === -1) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
  
      userComments.comments[commentIndex].content = content;
      userComments.comments[commentIndex].updated_at = new Date();
  
      await existingComment.save();
  
      return existingComment;
    } catch (error) {
      throw new HttpException(
        'Failed to update comment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
