import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { PlaylistSchema } from './schema/playlist.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Playlist', schema: PlaylistSchema }]), 
  ],
  controllers: [PlaylistController],
    providers: [PlaylistService],
    exports: [PlaylistService],  
})
export class PlaylistModule {}