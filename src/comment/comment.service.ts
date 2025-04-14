import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { iComment } from './interface/comment.interface';
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
  async createComment(createCommentDto: CreateCommentDto, userId: string): Promise<iComment> {
    const newComment = await this.commentModel.create({
      book_id: new Types.ObjectId(createCommentDto.bookId),
      user_id: new Types.ObjectId(userId),
      content: createCommentDto.content,
      replies: [],
      created_at: new Date(),
      updated_at: new Date(),
    });
    return newComment;
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE COMMENT
  // -------------------------------------------------------------------
  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');
    if (comment.user_id.toString() !== userId) throw new ForbiddenException('You can only update your own comment.');

    await this.commentModel.updateOne(
      { _id: commentId },
      {
        $set: {
          content: updateCommentDto.content,
          updated_at: new Date(),
        },
      },
    );

    return this.commentModel.findById(commentId);
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE COMMENT
  // -------------------------------------------------------------------
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');
    if (comment.user_id.toString() !== userId) throw new ForbiddenException('You can only delete your own comment.');

    await this.commentModel.deleteOne({ _id: commentId });
  }

  // -------------------------------------------------------------------
  // 🔸 CREATE REPLY
  // -------------------------------------------------------------------
  async createReply(commentId: string, createReplyDto: CreateReplyDto, userId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');

    await this.commentModel.updateOne(
      { _id: commentId },
      {
        $push: {
          replies: {
            user_id: new Types.ObjectId(userId),
            content: createReplyDto.content,
            created_at: new Date(),
          },
        },
      },
    );

    return this.commentModel.findById(commentId);
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE REPLY
  // -------------------------------------------------------------------
  async updateReply(commentId: string, replyId: string, updateReplyDto: UpdateReplyDto, userId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');

    const reply = comment.replies.find(r => r._id?.toString() === replyId);
    if (!reply) throw new NotFoundException('Reply not found.');
    if (reply.user_id.toString() !== userId) throw new ForbiddenException('You can only update your own reply.');

    await this.commentModel.updateOne(
      { _id: commentId, 'replies._id': replyId },
      {
        $set: {
          'replies.$.content': updateReplyDto.content,
          'replies.$.updated_at': new Date(),
        },
      },
    );

    return this.commentModel.findById(commentId);
  }

  // -------------------------------------------------------------------
  // 🔸 DELETE REPLY
  // -------------------------------------------------------------------
  async deleteReply(commentId: string, replyId: string, userId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found.');

    const reply = comment.replies.find(r => r._id?.toString() === replyId);
    if (!reply) throw new NotFoundException('Reply not found.');
    if (reply.user_id.toString() !== userId) throw new ForbiddenException('You can only delete your own reply.');

    await this.commentModel.updateOne(
      { _id: commentId },
      { $pull: { replies: { _id: new Types.ObjectId(replyId) } } },
    );

    return this.commentModel.findById(commentId);
  }

  // -------------------------------------------------------------------
  // 🔸 FIND COMMENTS BY BOOK
  // -------------------------------------------------------------------
  async findCommentsByBook(bookId: string): Promise<iComment[]> {
    const comments = await this.commentModel.find({
      book_id: new Types.ObjectId(bookId),
    }).sort({ created_at: -1 }); // คอมเมนต์ล่าสุดขึ้นก่อน

    return comments;
  }
}
