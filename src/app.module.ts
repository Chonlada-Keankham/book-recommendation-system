import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { CommentModule } from './comment/comment.module';
import { databaseConfig } from './config/database.config';
import { PlaylistModule } from './playlist/playlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true, 
    }),
    MongooseModule.forRoot(databaseConfig.uri),
    UserModule,
    AuthModule,
    BookModule,
    CommentModule,
    PlaylistModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'CONFIG_SERVICE',
      useClass: ConfigService,  
    },
  ],
})
export class AppModule {}
