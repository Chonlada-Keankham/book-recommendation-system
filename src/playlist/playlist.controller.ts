import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Post('/create-playlist')
  async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDto) {
    const playlist = await this.playlistService.createPlaylist(createPlaylistDto);
    return {
      statusCode: 201,
      message: 'Playlist created successfully',
      data: playlist,
    };
  }

  @Patch('/update/:userId')
  async updatePlaylist(
    @Param('userId') userId: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    const updatedPlaylist = await this.playlistService.updatePlaylist(userId, updatePlaylistDto);
    return {
      statusCode: 200,
      message: 'Playlist updated successfully',
      data: updatedPlaylist,
    };
  }

  @Get('/playlist/:userId')
  async getPlaylist(@Param('userId') userId: string) {
    const playlist = await this.playlistService.getPlaylist(userId);
    return {
      statusCode: 200,
      message: 'Playlist fetched successfully',
      data: playlist,
    };
  }
}
