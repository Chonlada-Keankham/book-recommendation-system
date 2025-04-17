import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
  forwardRef,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';
import { iComment } from './interface/comment.interface';
import { NotificationService } from 'src/notification/notification.service';
import { iReply } from './interface/reply.interface';
import { Reply } from './schema/reply.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) { }

  // 🔸 Create Comment
  async createComment(dto: CreateCommentDto, userId: string) {
    const newComment = new this.commentModel({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(dto.bookId),
      content: dto.content.trim(),
    });
    return newComment.save();
  }

  async findCommentsByBook(bookId: string) {
    if (!Types.ObjectId.isValid(bookId)) {
      throw new BadRequestException('Invalid bookId');
    }
    const comments = await this.commentModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .populate('userId', 'username')
      .populate('replies.userId', 'username')
      .sort({ createdAt: -1 })
      .exec();
    return comments;
  }

  async updateComment(
    commentId: string,
    dto: UpdateCommentDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid commentId');
    }
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('Cannot edit another user’s comment');
    }
    comment.content = dto.content.trim();
    return comment.save();
  }

  async deleteComment(commentId: string, userId: string) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid commentId');
    }
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('Cannot delete another user’s comment');
    }
    return comment.deleteOne();
  }

  async createReply(
    commentId: string,
    dto: CreateReplyDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new BadRequestException('Invalid commentId');
    }
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const reply: Partial<Reply> = {
      userId: new Types.ObjectId(userId),
      content: dto.content.trim(),
    };
    comment.replies.push(reply as iReply);
    await comment.save();

    if (comment.userId.toString() !== userId) {
      await this.notificationService.notifyReply(
        comment.userId.toString(),
        comment.bookId.toString(),
        'New reply to your comment',
      );
    }
    return comment;
  }


  async updateReply(
    commentId: string,
    replyId: string,
    dto: UpdateReplyDto,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(replyId)) {
      throw new BadRequestException('Invalid ID');
    }
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    // updateReply
    const reply = comment.replies.find(r => r._id.toString() === replyId);
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.userId.toString() !== userId) throw new ForbiddenException();
    // แก้ไข
    reply.content = dto.content.trim();
    await comment.save();
  }

  async deleteReply(
    commentId: string,
    replyId: string,
    userId: string,
  ) {
    if (!Types.ObjectId.isValid(commentId) || !Types.ObjectId.isValid(replyId)) {
      throw new BadRequestException('Invalid ID');
    }
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    // deleteReply
    const idx = comment.replies.findIndex(r => r._id.toString() === replyId);
    if (idx === -1) throw new NotFoundException('Reply not found');
    if (comment.replies[idx].userId.toString() !== userId) throw new ForbiddenException();
    comment.replies.splice(idx, 1);
    await comment.save();

  }
}


