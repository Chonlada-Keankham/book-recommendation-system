import { Status } from 'src/enum/status.enum';


export interface iCommentItem {
  content: string;
  created_at: Date;
}

export interface iUserComment {
  user: string;
  comments: iCommentItem[];
}

export interface iComment {
  book: string;
  users: iUserComment[];
  status: Status;
  created_at?: Date;
  updated_at?: Date;
}