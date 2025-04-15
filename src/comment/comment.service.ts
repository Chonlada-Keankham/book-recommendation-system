import { Injectable, NotFoundException, ForbiddenException, HttpStatus, forwardRef, Inject } from '@nestjs/common';
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
    const reply = await this.createReply(commentId, createReplyDto, userId);

    // ดึง comment เพื่อตรวจสอบว่า original user เป็นใคร
    const comment = await this.findCommentById(commentId);
    if (comment.userId.toString() !== userId) {
      await this.notificationService.notifyReply(comment.userId.toString(), comment.bookId.toString(), 'ชื่อหนังสือใส่ตรงนี้ถ้าจำเป็น');
      comment.replies.push({
        user_id: userId, // ✅ ใช้ userId
        content: createReplyDto.content.trim(),
        created_at: new Date(),
        updated_at: new Date(),
      });
      
      await this.notificationService.notifyReply(comment.userId.toString(), comment.bookId.toString(), 'ใส่ชื่อหนังสือถ้ามี');

    }
    
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Reply created successfully',
      data: reply,
    };
  }
      
  // ---------- Update Reply ----------
  async updateReply(commentId: string, replyId: string, updateReplyDto: UpdateReplyDto, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const reply = comment.replies.find(r => r._id.toString() === replyId);
    if (!reply) throw new NotFoundException('Reply not found');

    if (reply.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('You can only edit your own reply');
    }
    
    reply.content = updateReplyDto.content.trim();
    reply.updated_at = new Date();
    
    await comment.save();
    return comment;
  }

  // ---------- Delete Reply ----------
  async deleteReply(commentId: string, replyId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const replyIndex = comment.replies.findIndex(r => r._id.toString() === replyId);
    if (replyIndex === -1) throw new NotFoundException('Reply not found');

    if (comment.replies[replyIndex].user_id.toString() !== userId.toString()) {
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
  async findCommentById(commentId: string): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }
  
}
