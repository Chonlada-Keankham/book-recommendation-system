import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'general', // ✅ ตั้ง default folder
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      const stream = Readable.from(file.buffer);
      stream.pipe(upload);
    });
  }
  // cloudinary.service.ts
async deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

}
