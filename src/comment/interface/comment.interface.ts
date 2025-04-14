export interface iComment {
  _id?: string;                      // MongoDB ID (optional)

  book_id: string;                   // อ้างอิงไปยังหนังสือ (_id ของ iBook)
  
  user_id: string;                   // อ้างอิงไปยังผู้ใช้ (_id ของ User)

  content: string;                   // เนื้อหาคอมเมนต์

  replies: {
    _id?: string;                    // MongoDB ID ของ reply (optional)
    user_id: string;                 // อ้างอิงไปยังผู้ใช้ (_id ของ User)
    content: string;                 // เนื้อหาการตอบกลับ
    created_at: Date;                // วันเวลาสร้าง reply
    updated_at?: Date;               // วันเวลาแก้ไข reply (optional)
  }[];

  created_at: Date;                  // วันเวลาสร้างคอมเมนต์
  updated_at: Date;                  // วันเวลาอัปเดตคอมเมนต์
  deleted_at?: Date;                 // (optional) วันเวลาลบคอมเมนต์ (soft delete)
}
