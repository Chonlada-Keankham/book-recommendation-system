import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment, CommentDocument } from './schema/comment.schema';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
  ) { }

  // 🔸 Create Comment
  async createComment(createCommentDto: CreateCommentDto, userId: string) {
    const comment = new this.commentModel({
      bookId: createCommentDto.bookId,
      userId: userId,
      content: createCommentDto.content.trim(),
      replies: [],
    });
    return await comment.save();
  }

  // ---------- Update Comment ----------
  async updateComment(commentId: string, updateCommentDto: UpdateCommentDto, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only edit your own comment');
    }

    comment.content = updateCommentDto.content.trim();
    await comment.save();
    return comment;
  }

  // ---------- Delete Comment ----------
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    return await comment.deleteOne();
  }

  // ---------- Create Reply ----------
  async createReply(commentId: string, createReplyDto: CreateReplyDto, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    comment.replies.push({
      userId: userId,
      content: createReplyDto.content.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await comment.save();
    return comment;
  }

  // ---------- Update Reply ----------
  async updateReply(commentId: string, replyId: string, updateReplyDto: UpdateReplyDto, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const reply = comment.replies.find(r => r._id.toString() === replyId);
    if (!reply) throw new NotFoundException('Reply not found');

    if (reply.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only edit your own reply');
    }

    reply.content = updateReplyDto.content.trim();
    reply.updatedAt = new Date();

    await comment.save();
    return comment;
  }

  // ---------- Delete Reply ----------
  async deleteReply(commentId: string, replyId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const replyIndex = comment.replies.findIndex(r => r._id.toString() === replyId);
    if (replyIndex === -1) throw new NotFoundException('Reply not found');

    if (comment.replies[replyIndex].userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own reply');
    }

    comment.replies.splice(replyIndex, 1);
    await comment.save();
    return true;
  }

  // 🔸 Find All Comments for a Book
  async findCommentsByBook(bookId: string) {
    return this.commentModel.find({ bookId: new Types.ObjectId(bookId) }) 
      .populate('userId', 'username')
      .populate('replies.userId', 'username')
      .sort({ createdAt: -1 });
  }
}
