import { Status } from 'src/enum/status.enum';

export interface iComment {
  _id?: string; 
  user: string; 
  username: string; 
  book: string; 
  content: string; 
  status: Status; 
  created_at: Date; 
  updated_at: Date; 
  deleted_at?: Date; 
}
