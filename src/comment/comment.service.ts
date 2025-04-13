import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { BookService } from 'src/book/book.service';
import { Status } from 'src/enum/status.enum';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private readonly commentModel: Model<iComment>,
    private readonly bookService: BookService,
  ) {}

  // 🔸 CREATE
  async createComment(createCommentDto: CreateCommentDto): Promise<iComment> {
    const bookExists = await this.bookService.findOneByIdAndUpdateView(createCommentDto.book.toString(), '');
    if (!bookExists) throw new NotFoundException('Book not found');

    const newComment = new this.commentModel({
      ...createCommentDto,
      status: Status.ACTIVE,
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return newComment.save();
  }

  // 🔸 READ
  async findCommentById(commentId: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      _id: commentId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).populate('user', 'username');

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async findCommentsByBookId(bookId: string): Promise<iComment[]> {
    const comments = await this.commentModel.find({
      book: bookId,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).populate('user', 'username');

    if (!comments.length) {
      throw new NotFoundException('No comments found for this book.');
    }

    return comments;
  }

  // 🔸 UPDATE
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
  
  // 🔸 DELETE
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
}
