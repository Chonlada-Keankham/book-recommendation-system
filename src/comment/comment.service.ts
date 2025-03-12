import { Injectable } from '@nestjs/common';
import { iComment } from './interface/comment.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Status } from 'src/enum/status.enum';
import { UserService } from 'src/user/user.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BookService } from 'src/book/book.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')  
    private readonly commentModel: Model<iComment>,
    private readonly userService: UserService,
    private readonly bookService: BookService,

  ) { }

  async createOne(createCommentDto: CreateCommentDto): Promise<iComment> {
    const existingComment = await this.commentModel.findOne({
      $and: [
        { user: createCommentDto.user },  
        { book: createCommentDto.book },  
      ]
    });

    if (existingComment) {
      throw new Error('This user has already commented on this book.');
    }

    const newComment = new this.commentModel({
      ...createCommentDto,
      status: Status.ACTIVE,
      deleted_at: null,
    });

    return await newComment.save();
  }
}
