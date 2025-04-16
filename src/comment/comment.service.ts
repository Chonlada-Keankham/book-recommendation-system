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
import { iReply } from './interface/reply.interface';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  // 🔸 Create Comment
// comment.service.ts
async createComment(createCommentDto: CreateCommentDto, userId: string) {
  const comment = new this.commentModel({
    bookId: createCommentDto.bookId,
    userId,
    content: createCommentDto.content.trim(),
    replies: [],
  });
  const saved = await comment.save();
  return {
    _id: saved._id.toString(),
    bookId: saved.bookId.toString(),
    userId: saved.userId.toString(),
    content: saved.content,
    replies: [],
    createdAt: saved.created_at,
    updatedAt: saved.updated_at,
  };
}

  // 🔸 Create Reply
  async createReply(
    commentId: string,
    createReplyDto: CreateReplyDto,
    userId: string,
  ) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const newReply: iReply = {
      _id: new Types.ObjectId().toString(),
      userId: userId,
      content: createReplyDto.content.trim(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    comment.replies.push(newReply);
    await comment.save();

    // ส่ง notification หากคนตอบไม่ใช่เจ้าของ comment
    if (comment.userId.toString() !== userId) {
      await this.notificationService.notifyReply(
        comment.userId.toString(),
        comment.bookId.toString(),
        'ใส่ชื่อหนังสือถ้ามี',
      );
    }

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reply created successfully',
      data: newReply,
    };
  }

  // 🔹 Update Comment
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

  // 🔹 Update Reply
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

  // 🔻 Delete Comment
  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only delete your own comment');
    }

    return await comment.deleteOne();
  }

  // 🔻 Delete Reply
  async deleteReply(commentId: string, replyId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const index = comment.replies.findIndex(
      (r) => r._id?.toString() === replyId,
    );
    if (index === -1) throw new NotFoundException('Reply not found');

    if (
      comment.replies[index].userId.toString() !== userId.toString()
    ) {
      throw new ForbiddenException('You can only delete your own reply');
    }

    comment.replies.splice(index, 1);
    await comment.save();

    return {
      statusCode: HttpStatus.OK,
      message: 'Reply deleted successfully',
    };
  }

  async findCommentsByBook(bookId: string) {
    const comments = await this.commentModel.find({
      $or: [
        { bookId: new Types.ObjectId(bookId) },
        { bookId: bookId }, 
      ],
    })
      .populate('userId', 'username')
      .populate('replies.userId', 'username')
      .sort({ createdAt: -1 });
  
    console.log('📦 Found:', comments.length);
  
    return comments.map((c) => ({
      _id: c._id.toString(),
      bookId: c.bookId.toString(),
      userId: c.userId.toString(),
      content: c.content,
      replies: c.replies.map((r) => ({
        _id: r._id?.toString(),
        userId: r.userId.toString(),
        content: r.content,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
      createdAt: c.created_at,
      updatedAt: c.updated_at,
      deletedAt: c.deleted_at,
    }));
  }
  
  async findCommentById(commentId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }
}
