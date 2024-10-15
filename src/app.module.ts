import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),  
    MongooseModule.forRoot(databaseConfig.uri), UserModule, AuthModule,
   ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
