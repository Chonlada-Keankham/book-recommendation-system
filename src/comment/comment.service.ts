import {  Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Status } from 'src/enum/status.enum';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<iComment>,
  ) {}

  // -------------------------------------------------------------------
  // 🔸 CREATE COMMENT
  // -------------------------------------------------------------------
  async createComment(createCommentDto: CreateCommentDto, req: any) {
    const userId = (req.user as any).id;
    const { book, content } = createCommentDto;

    const existingComment = await this.commentModel.findOne({ book: new Types.ObjectId(book) });

    if (existingComment) {
      let userBlock = existingComment.users.find(
        (u) => u.user.toString() === userId.toString()
      );

      if (!userBlock) {
        userBlock = {
          user: new Types.ObjectId(userId),
          comments: [],
        };
        existingComment.users.push(userBlock);
      }

      userBlock.comments.push({
        _id: new Types.ObjectId(),
        content: content.trim(),
        created_at: new Date(),
        updated_at: new Date(),
        replies: [],
      });

      await existingComment.save();
      return existingComment;
    }

    const newComment = new this.commentModel({
      book: new Types.ObjectId(book),
      status: Status.ACTIVE,
      deleted_at: null,
      users: [
        {
          user: new Types.ObjectId(userId),
          comments: [
            {
              _id: new Types.ObjectId(),
              content: content.trim(),
              created_at: new Date(),
              updated_at: new Date(),
              replies: [],
            },
          ],
        },
      ],
    });

    return await newComment.save();
  }

  // -------------------------------------------------------------------
  // 🔸 FIND ALL COMMENT BY BOOK
  // -------------------------------------------------------------------
  async findAllByBookId(bookId: string) {
    const comments = await this.commentModel.findOne({
      book: new Types.ObjectId(bookId),
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).populate('users.user', 'username');

    if (!comments) {
      return [];
    }

    return comments.users.map((userBlock) => ({
      users: [
        {
          user: { 
            username: typeof userBlock.user === 'object' && 'username' in userBlock.user 
              ? userBlock.user.username 
              : 'Anonymous' 
          },
          comments: userBlock.comments.map((cmt) => ({
            _id: cmt._id,
            content: cmt.content,
            replies: cmt.replies.map((reply) => ({
              content: reply.content,
            })),
          })),
        },
      ],
    }));
  }

  // -------------------------------------------------------------------
  // 🔸 CREATE REPLY
  // -------------------------------------------------------------------
  async createReply(parentCommentId: string, createReplyDto: CreateReplyDto, req: any) {
    const userId = (req.user as any).id;
    const { content } = createReplyDto;

    const comment = await this.commentModel.findOne({
      'users.comments._id': new Types.ObjectId(parentCommentId),
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    for (const userBlock of comment.users) {
      for (const cmt of userBlock.comments) {
        if (cmt._id.toString() === parentCommentId) {
          cmt.replies.push({
            _id: new Types.ObjectId(),
            user: new Types.ObjectId(userId),
            content: content.trim(),
            created_at: new Date(),
            updated_at: new Date(),
          });
          break;
        }
      }
    }

    await comment.save();
    return comment;
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE COMMENT
  // -------------------------------------------------------------------
  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.commentModel.findOne({
      'users.comments._id': new Types.ObjectId(commentId),
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    for (const userBlock of comment.users) {
      for (const cmt of userBlock.comments) {
        if (cmt._id.toString() === commentId) {
          cmt.content = updateCommentDto.content.trim();
          cmt.updated_at = new Date();
          break;
        }
      }
    }

    await comment.save();
    return comment;
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE REPLY
  // -------------------------------------------------------------------
  async updateReply(replyId: string, updateReplyDto: UpdateReplyDto) {
    const comment = await this.commentModel.findOne({
      'users.comments.replies._id': new Types.ObjectId(replyId),
    });

    if (!comment) {
      throw new NotFoundException('Reply not found');
    }

    for (const userBlock of comment.users) {
      for (const cmt of userBlock.comments) {
        for (const reply of cmt.replies) {
          if (reply._id.toString() === replyId) {
            reply.content = updateReplyDto.content.trim();
            reply.updated_at = new Date();
            break;
          }
        }
      }
    }

    await comment.save();
    return comment;
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE COMMENT (Hard Delete)
  // -------------------------------------------------------------------
  async deleteComment(commentId: string) {
    await this.commentModel.updateMany(
      {},
      { $pull: { 'users.$[].comments': { _id: new Types.ObjectId(commentId) } } }
    );
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE REPLY (Hard Delete)
  // -------------------------------------------------------------------
  async deleteReply(replyId: string) {
    await this.commentModel.updateMany(
      {},
      { $pull: { 'users.$[].comments.$[].replies': { _id: new Types.ObjectId(replyId) } } }
    );
  }
}
