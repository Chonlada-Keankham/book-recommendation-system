import {HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Status } from 'src/enum/status.enum';
import { UserService } from 'src/user/user.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BookService } from 'src/book/book.service';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<iComment>,
    private readonly userService: UserService,
    private readonly bookService: BookService,
  ) { }
  
  async createComment(createCommentDto: CreateCommentDto): Promise<iComment> {
    try {
      const { book, user, content } = createCommentDto;
  
      // ตรวจสอบว่าผู้ใช้มีอยู่
      const existingUser = await this.userService.findOneById(user.toString());  // แปลงเป็น string
      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
  
      // ตรวจสอบว่า Book มีอยู่
      const existingBook = await this.bookService.findOneById(book.toString());  // แปลงเป็น string
      if (!existingBook) {
        throw new HttpException('Book not found', HttpStatus.NOT_FOUND);
      }
  
      // สร้างคอมเมนต์ใหม่
      const commentItem = {
        book: book,         // เล่มที่คอมเมนต์
        user: user,         // ผู้ใช้ที่คอมเมนต์
        content,            // เนื้อหาคอมเมนต์
        created_at: new Date(),
        updated_at: new Date(),
      };
  
      // สร้างคอมเมนต์ใหม่ใน collection comment
      const newComment = await this.commentModel.create(commentItem);
  
      return newComment;
    } catch (error) {
      console.error(error); // แสดงข้อผิดพลาดใน console เพื่อให้ตรวจสอบได้
      throw new HttpException(
        'Failed to create comment. Please try again later.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
      
    async findOneById(id: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      _id: id,
      status: { $ne: Status.DELETED },
      deleted_at: null,
    }).exec();

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found or has been deleted.`);
    }

    return comment;
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ comments: iComment[], total: number }> {
    const skip = (page - 1) * limit;
  
    const total = await this.commentModel.countDocuments({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    const comments = await this.commentModel.find(
      { status: { $ne: Status.DELETED }, deleted_at: null },
    )
      .skip(skip) 
      .limit(limit) 
      .exec();
  
    return { comments, total };
  }
  
  async updateComment(bookId: string, userId: string, updateCommentDto: UpdateCommentDto): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      'book': bookId,
      'users.user': userId,
      'status': { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
  
    const userCommentIndex = comment.users.findIndex(user => user.user.toString() === userId);
  
    if (userCommentIndex === -1) {
      throw new NotFoundException('User comment not found.');
    }
  
    comment.users[userCommentIndex].comments.forEach((userComment) => {
      userComment.content = updateCommentDto.content;
      userComment.updated_at = new Date();
    });
  
    await comment.save();
  
    return comment;
  }
    
  async softDelete(bookId: string, userId: string): Promise<iComment> {
    const comment = await this.commentModel.findOne({
      'book': bookId,
      'users.user': userId,
      'status': { $ne: Status.DELETED },
      deleted_at: null,
    });
  
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
  
    comment.deleted_at = new Date();
  
    return await comment.save();
  }
  
  async deleteById(bookId: string, userId: string): Promise<boolean> {
    const comment = await this.commentModel.findOne({
      'book': bookId,
      'users.user': userId,
    });
  
    if (!comment) {
      throw new NotFoundException('Comment not found.');
    }
  
    await this.commentModel.deleteOne({
      'book': bookId,
      'users.user': userId,
    });
  
    return true;
  }
  
}
