import * as fs from 'fs';
import * as path from 'path';
import * as mongoose from 'mongoose';
import { config } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

config();

// ---------------- CONFIG ----------------
const BOOK_DIR = path.join(__dirname, '../uploads/book');
const DB_URI = process.env.DATABASE_URI || '';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------- SCHEMA ----------------
const bookSchema = new mongoose.Schema({ img: String });
const Book = mongoose.model('Book', bookSchema, 'books');

// ---------------- MAIN ------------------
(async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('\n📦 Migrating book images...');

    const files = fs.readdirSync(BOOK_DIR);

    for (const file of files) {
      const filePath = path.join(BOOK_DIR, file);
      const localPath = `/uploads/book/${file}`;
      if (!fs.statSync(filePath).isFile()) continue;

      const booksUsingImage = await Book.find({ img: localPath });
      if (!booksUsingImage.length) {
        console.warn(`⚠️ Skipped: No book uses ${localPath}`);
        continue;
      }

      // เช็กว่าอัปโหลดไป Cloud แล้วหรือยัง (จากเรคคอร์ดแรกพอ)
      if (booksUsingImage[0].img.startsWith('http')) {
        console.log(`⚠️ Already migrated: ${file}`);
        continue;
      }

      console.log(`⬆️ Uploading: ${file}`);
      const result = await cloudinary.uploader.upload(filePath, { folder: 'book' });

      const updateResult = await Book.updateMany(
        { img: localPath },
        { $set: { img: result.secure_url } }
      );

      console.log(`✅ Updated ${updateResult.modifiedCount} record(s) for file: ${file}`);
    }

    console.log('\n🎉 Migration complete!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
