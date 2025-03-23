import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
  ) {}
  
  async createOne(createCommentDto: CreateCommentDto): Promise<iComment> {
    // เช็คว่า Book ที่มี ID นี้มีอยู่ในระบบหรือไม่
    const existingBook = await this.bookService.findOneById(createCommentDto.book.toString()); // แปลงเป็น string
    if (!existingBook) {
      throw new Error('Book does not exist.');
    }
  
    // เช็คว่า User ที่เกี่ยวข้องมีอยู่ในระบบหรือไม่
    const userExists = await this.userService.findOneById(createCommentDto.user.toString()); // แปลงเป็น string
    if (!userExists) {
      throw new Error('User does not exist.');
    }
  
    const duplicateComment = await this.commentModel.findOne({
      book: createCommentDto.book,
      'users.user': createCommentDto.user,
      'users.comments.content': createCommentDto.content
    });
  
    if (duplicateComment) {
      throw new Error('This comment already exists for this book by this user.');
    }
  
    // สร้าง Comment ใหม่
    const newComment = new this.commentModel({
      book: createCommentDto.book,
      users: [{
        user: createCommentDto.user,
        comments: [{
          content: createCommentDto.content,
          created_at: new Date(),
        }],
      }],
      status: Status.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    });
  
    return await newComment.save();
  }
  
      
}
