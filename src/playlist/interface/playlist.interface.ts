import { Types } from "mongoose";

export interface IPlaylist {
  _id?: string;
  user: string | Types.ObjectId;
  categories: string[];
  authors: string[];
  recommendedBooks: any[];
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}
