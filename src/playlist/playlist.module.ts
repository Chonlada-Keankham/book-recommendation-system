import { MongooseModule } from '@nestjs/mongoose';
import { PlaylistSchema } from './schema/playlist.schema';
import { Module, forwardRef } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { BookModule } from 'src/book/book.module';

@Module({
  imports: [
      forwardRef(() => PlaylistModule),  
      BookModule,  
      MongooseModule.forFeature([{ name: 'Playlist', schema: PlaylistSchema }]), 
    ],
  controllers: [PlaylistController],
  providers: [PlaylistService],
    exports: [PlaylistService],  
  
})
export class PlaylistModule {}
