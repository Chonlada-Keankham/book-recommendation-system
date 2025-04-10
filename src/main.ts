import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ตั้งค่า Global Prefix สำหรับ API
  app.setGlobalPrefix('api');

  // เปิดใช้งาน CORS สำหรับการเข้าถึงจาก localhost:3000
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // ตั้งค่า Swagger สำหรับเอกสาร API
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ให้บริการไฟล์ static จากโฟลเดอร์ 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',  // ทุกไฟล์ในโฟลเดอร์นี้จะสามารถเข้าถึงได้ผ่านเส้นทาง '/uploads/'
  });

  // เริ่มเซิร์ฟเวอร์
  await app.listen(process.env.PORT || 5000, '0.0.0.0');
}

bootstrap();
