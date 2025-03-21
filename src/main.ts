import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://172.22.160.1:3000', 
    methods: 'GET,POST,PUT,DELETE',
    credentials: true, 
  });
  await app.listen(5000, '0.0.0.0');
}


bootstrap();
