import { BookService } from 'src/book/book.service';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,

  ) { }


  async likeComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    const uid = new Types.ObjectId(userId);
    if (!comment.likedBy.includes(uid)) {
      comment.likedBy.push(uid);
      await comment.save();
    }
    return { likeCount: comment.likedBy.length, likedByMe: true };
  }

  async unlikeComment(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
    await comment.save();
    return { likeCount: comment.likedBy.length, likedByMe: false };
  }

  async likeReply(commentId: string, replyId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    const reply = (comment.replies as any).id(replyId);
    if (!reply) throw new NotFoundException('Reply not found');
    const uid = new Types.ObjectId(userId);
    if (!reply.likedBy.includes(uid)) {
      reply.likedBy.push(uid);
      await comment.save();
    }
    return { replyId, likeCount: reply.likedBy.length, likedByMe: true };
  }

  async unlikeReply(commentId: string, replyId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');
    const reply = (comment.replies as any).id(replyId);
    if (!reply) throw new NotFoundException('Reply not found');
    reply.likedBy = reply.likedBy.filter(id => id.toString() !== userId);
    await comment.save();
    return { replyId, likeCount: reply.likedBy.length, likedByMe: false };
  }
  // 🔸 Create Comment
  async createComment(dto: CreateCommentDto, userId: string) {
    const newComment = new this.commentModel({
      userId: new Types.ObjectId(userId),
      bookId: new Types.ObjectId(dto.bookId),
      content: dto.content.trim(),
    });
    return newComment.save();
  }

// src/comment/comment.service.ts
// src/comment/comment.service.ts
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

  return comments.map(c => ({
    _id: c._id.toString(),
    bookId: c.bookId.toString(),
    userId: (c.userId as any)._id.toString(),
    username: (c.userId as any).username,
    content: c.content,
    // ใช้ createdAt / updatedAt ที่ mongoose timestamps สร้างให้
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    replies: c.replies.map(r => ({
      _id: r._id.toString(),
      userId: (r.userId as any)._id.toString(),
      username: (r.userId as any).username,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt?.toISOString(),
    })),
    // ถ้าใช้ like/Unlike ก็ใส่ likeCount, likedByMe ไว้ด้วย
  }));
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
  
    // ✅ เตรียมค่าที่ต้องใช้สำหรับ notification
    const originalUserId = comment.userId.toString(); // เจ้าของคอมเมนต์ต้นฉบับ
    const bookId = comment.bookId.toString();         // ID หนังสือจากคอมเมนต์
    const book = await this.bookService.findById(bookId); // ดึงข้อมูลหนังสือ (ถ้ายังไม่มี)
    const bookTitle = book?.book_th || 'หนังสือ';
  
    // ✅ ส่ง Notification แจ้งเตือนเจ้าของคอมเมนต์
    await this.notificationService.notifyReply(
      originalUserId,
      bookId,
      bookTitle,
      comment._id.toString()
    );
  
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

    const reply = comment.replies.find(r => r._id.toString() === replyId);
    if (!reply) throw new NotFoundException('Reply not found');
    if (reply.userId.toString() !== userId) throw new ForbiddenException();
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


