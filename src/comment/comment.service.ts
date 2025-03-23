import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { iComment, iCommentItem } from './interface/comment.interface';
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

}
