import { Types } from 'mongoose';

export class CreateCommentDto {
  user: Types.ObjectId;
  book: Types.ObjectId;
  content: string;
}
