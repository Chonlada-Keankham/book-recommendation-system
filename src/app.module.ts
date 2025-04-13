import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BookModule } from './book/book.module';
import { CommentModule } from './comment/comment.module';
import { PlaylistModule } from './playlist/playlist.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { NotificationModule } from './notification/notification.module';

@Module({
  
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: (await import('cache-manager-ioredis')).redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: parseInt(configService.get<string>('REDIS_PORT'), 10),
      }),
    }),

    ScheduleModule.forRoot(),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URI'),
      }),
    }),

    UserModule,
    AuthModule,
    BookModule,
    CommentModule,
    PlaylistModule,
    NotificationModule,
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
