import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpStatus,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CreateReplyDto } from './dto/reply-comment.dto';
import { UpdateReplyDto } from './dto/up-reply-comment.dto';
import { iComment } from './interface/comment.interface';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  // -------------------------------------------------------------------
  // 🔸 CREATE
  // -------------------------------------------------------------------

  async createComment(createCommentDto: CreateCommentDto, userId: string) {
    const comment = new this.commentModel({
      bookId: new Types.ObjectId(createCommentDto.bookId),
      userId: new Types.ObjectId(userId),
      content: createCommentDto.content.trim(),
      replies: [],
    });
    return await comment.save();
  }

  async createReply(
    commentId: string,
    createReplyDto: CreateReplyDto,
    userId: string,
  ) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const newReply = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      content: createReplyDto.content.trim(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    comment.replies.push(newReply);
    await comment.save();

    if (comment.userId.toString() !== userId.toString()) {
      await this.notificationService.notifyReply(
        comment.userId.toString(),
        comment.bookId.toString(),
        'ชื่อหนังสือใส่ตรงนี้ถ้าจำเป็น',
      );
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reply created successfully',
      data: newReply,
    };
  }

  // -------------------------------------------------------------------
  // 🔹 UPDATE
  // -------------------------------------------------------------------

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only edit your own comment');
    }

    comment.content = updateCommentDto.content.trim();
    await comment.save();
    return comment;
  }

  async updateReply(
    commentId: string,
    replyId: string,
    updateReplyDto: UpdateReplyDto,
    userId: string,
  ) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const reply = comment.replies.find(
      (r) => r._id?.toString() === replyId,
    );
    if (!reply) throw new NotFoundException('Reply not found');

    if (reply.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only edit your own reply');
    }

    reply.content = updateReplyDto.content.trim();
    reply.updated_at = new Date();

    await comment.save();

    return {
      statusCode: HttpStatus.OK,
      message: 'Reply updated successfully',
      data: reply,
    };
  }

  // -------------------------------------------------------------------
  // 🔻 DELETE
  // -------------------------------------------------------------------

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    return await comment.deleteOne();
  }

  async deleteReply(
    commentId: string,
    replyId: string,
    userId: string,
  ) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const replyIndex = comment.replies.findIndex(
      (r) => r._id?.toString() === replyId,
    );
    if (replyIndex === -1)
      throw new NotFoundException('Reply not found');

    if (
      comment.replies[replyIndex].userId.toString() !== userId.toString()
    ) {
      throw new ForbiddenException('You can only delete your own reply');
    }

    comment.replies.splice(replyIndex, 1);
    await comment.save();
    return {
      statusCode: HttpStatus.OK,
      message: 'Reply deleted successfully',
    };
  }

  // -------------------------------------------------------------------
  // 🔍 READ
  // -------------------------------------------------------------------

  async findCommentsByBook(bookId: string) {
    return this.commentModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .populate('userId', 'username')
      .populate('replies.userId', 'username')
      .sort({ created_at: -1 }); // ใช้ timestamps field ที่ถูกสร้างอัตโนมัติ
  }

  async findCommentById(commentId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }
}
