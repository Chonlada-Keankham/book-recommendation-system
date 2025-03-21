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

  async createOne(createCommentDto: CreateCommentDto): Promise<iComment> {
    try {
      const user = await this.userService.findOneById(createCommentDto.user);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const commentItem: iCommentItem = {
        content: createCommentDto.content,
        created_at: new Date(),
      };

      const updatedComment = await this.commentModel.findOneAndUpdate(
        { user: createCommentDto.user, book: createCommentDto.book },
        {
          $push: { comments: commentItem },
          username: user.username,
          status: Status.ACTIVE,
          deleted_at: null,
        },
        { upsert: true, new: true }
      );

      return updatedComment;
    } catch (error) {
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

    const comments = await this.commentModel.find({
      status: { $ne: Status.DELETED },
      deleted_at: null,
    })
      .skip(skip)
      .limit(limit)
      .exec();

    return { comments, total };
  }

  async updateOne(commentId: string, updateCommentDto: UpdateCommentDto, index: number): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!comment.comments[index]) {
      throw new NotFoundException('Comment item not found');
    }

    comment.comments[index].content = updateCommentDto.content;
    comment.comments[index].created_at = new Date();

    await comment.save();
    return comment;
  }

  async softDelete(commentId: string, index: number): Promise<iComment> {
    const comment = await this.commentModel.findById(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (!comment.comments[index]) {
      throw new NotFoundException('Comment item not found');
    }

    comment.comments.splice(index, 1); 
    await comment.save();
    return comment;
  }

  async deleteById(commentId: string): Promise<boolean> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    await this.commentModel.deleteOne({ _id: commentId });
    return true;
  }
}
