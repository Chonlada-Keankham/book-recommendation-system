import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserService } from 'src/user/user.service';
import { BookService } from 'src/book/book.service';
import { Status } from 'src/enum/status.enum';
import { Request } from 'express';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) {}

  // -------------------------------------------------------------------
  // 🔸 CREATE COMMENT
  // -------------------------------------------------------------------
  async createComment(createCommentDto: CreateCommentDto, req: Request): Promise<iComment> {
    try {
      const user = await this.userService.findOneById(createCommentDto.user.toString());
      if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const book = await this.bookService.findOneByIdAndUpdateView(
        createCommentDto.book.toString(),
        ip?.toString() || ''
      );
      if (!book) throw new HttpException('Book not found', HttpStatus.NOT_FOUND);

      const existingComment = await this.commentModel.findOne({ book: createCommentDto.book });

      if (existingComment) {
        const userComments = existingComment.users.find(
          u => u.user.toString() === createCommentDto.user.toString()
        );

        if (userComments) {
          const existingUserComment = userComments.comments.find(
            comment => comment.content.trim() === createCommentDto.content.trim()
          );

          if (!existingUserComment) {
            userComments.comments.push({
              _id: new Types.ObjectId(),
              content: createCommentDto.content.trim(),
              created_at: new Date(),
              updated_at: new Date(),
              replies: [],  // ✅ เพิ่มตรงนี้
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
                content: createCommentDto.content.trim(),
                created_at: new Date(),
                updated_at: new Date(),
                replies: [], // ✅ เพิ่มตรงนี้
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
                content: createCommentDto.content.trim(),
                created_at: new Date(),
                updated_at: new Date(),
                replies: [], // ✅ เพิ่มตรงนี้
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
      }).populate('users.user').exec();

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
  // 🔸 UPDATE COMMENT
  // -------------------------------------------------------------------
  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto): Promise<iComment> {
    const commentDoc = await this.commentModel.findOne({
      'users.comments._id': new Types.ObjectId(commentId),
    });
  
    if (!commentDoc) {
      throw new NotFoundException('Comment not found.');
    }
  
    let updated = false;
  
    for (const user of commentDoc.users) {
      for (const cmt of user.comments) {
        if (cmt._id.toString() === commentId) {
          cmt.content = updateCommentDto.content.trim();
          cmt.updated_at = new Date();
          updated = true;
          break;
        }
      }
      if (updated) break;
    }
  
    if (!updated) {
      throw new NotFoundException('Comment not found.');
    }
  
    await commentDoc.save();
    return commentDoc;
  }
  
// -------------------------------------------------------------------
// 🔸 DELETE COMMENT
// -------------------------------------------------------------------
async deleteComment(commentId: string): Promise<boolean> {
  const comment = await this.commentModel.findOne({
    _id: commentId,
    status: { $ne: Status.DELETED },
    deleted_at: null,
  });

  if (!comment) throw new NotFoundException('Comment not found');

  await this.commentModel.deleteOne({ _id: commentId });
  return true;
}

  // -------------------------------------------------------------------
  // 🔸 CREATE REPLY
  // -------------------------------------------------------------------
  async createReply(commentId: string, userId: string, content: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      'users.comments._id': commentId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    let replied = false;

    for (const userBlock of comment.users) {
      for (const cmt of userBlock.comments) {
        if (cmt._id.toString() === commentId) {
          cmt.replies.push({
            _id: new Types.ObjectId(),
            user: new Types.ObjectId(userId),
            content: content.trim(),
            created_at: new Date(),
            updated_at: new Date(),
          });
          replied = true;
          break;
        }
      }
      if (replied) break;
    }

    if (!replied) {
      throw new NotFoundException('Comment not found for reply');
    }

    await comment.save();
    return comment;
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE REPLY
  // -------------------------------------------------------------------
  async updateReply(replyId: string, newContent: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      'users.comments.replies._id': replyId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });

    if (!comment) {
      throw new NotFoundException('Reply not found');
    }

    let updated = false;

    for (const userBlock of comment.users) {
      for (const cmt of userBlock.comments) {
        const reply = cmt.replies.find(r => r._id.toString() === replyId);
        if (reply) {
          reply.content = newContent.trim();
          reply.updated_at = new Date();
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (!updated) {
      throw new NotFoundException('Reply not found');
    }

    await comment.save();
    return comment;
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE REPLY
  // -------------------------------------------------------------------
  async deleteReply(replyId: string): Promise<boolean> {
    const comment = await this.commentModel.findOne({
      'users.comments.replies._id': replyId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });

    if (!comment) {
      throw new NotFoundException('Reply not found');
    }

    for (const userBlock of comment.users) {
      for (const cmt of userBlock.comments) {
        const index = cmt.replies.findIndex(r => r._id.toString() === replyId);
        if (index !== -1) {
          cmt.replies.splice(index, 1);
          break;
        }
      }
    }

    await comment.save();
    return true;
  }
}
