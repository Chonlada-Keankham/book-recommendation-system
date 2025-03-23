import { Types } from 'mongoose';
import { Status } from 'src/enum/status.enum';


export interface iComment {
  book: Types.ObjectId;
  users: {
    user: Types.ObjectId;
    comments: {
      content: string;
      created_at: Date;
    }[];
  }[];
  status: Status;
  created_at: Date;
  updated_at: Date;
}