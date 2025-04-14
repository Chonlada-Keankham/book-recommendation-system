export interface iComment {
  _id?: string;                      

  book_id: string;                   
  
  user_id: string;                   

  content: string;                   

  replies: {
    _id?: string;                    
    user_id: string;                 
    content: string;                 
    created_at: Date;               
    updated_at?: Date;               
  }[];

  created_at: Date;                  
  updated_at: Date;                  
  deleted_at?: Date;                
}
