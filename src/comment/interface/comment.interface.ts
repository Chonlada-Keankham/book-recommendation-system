import { Status } from 'src/enum/status.enum';

export interface iCommentItem {
  content: string;
  created_at: Date;
}

export interface iComment {
  _id?: string; 
  user: string; 
  book: string; 
  comments: iCommentItem[];  
  status: Status; 
  created_at?: Date; 
  updated_at?: Date; 
  deleted_at?: Date; 
  username?: string;
}
