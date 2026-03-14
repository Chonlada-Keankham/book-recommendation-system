import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  const origin = (process.env.FRONTEND_URL)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.enableCors({
  origin: origin,
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization','ngrok-skip-browser-warning'],
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
});


  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('example')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 5000, '0.0.0.0');
}

bootstrap();
