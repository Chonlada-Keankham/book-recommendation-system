export interface iReply {
  _id?: string;             
  userId: string;
  content: string;
  created_at?: Date;
  updated_at?: Date;
}