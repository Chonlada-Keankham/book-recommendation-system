import { Types } from "mongoose";

export interface iPlaylist {
  _id?: Types.ObjectId;

  user: Types.ObjectId;

  categories: string[];

  authors: string[];

  recommendedBooks: Types.ObjectId[] | any[];  

  created_at?: Date;

  updated_at?: Date;

  deleted_at?: Date;
}
