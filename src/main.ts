import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ConfigModule } from '@nestjs/config';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  ConfigModule.forRoot(); 
  await app.listen(3000);
}

bootstrap();
