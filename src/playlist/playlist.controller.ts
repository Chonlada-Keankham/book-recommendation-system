import { Controller, Get, Post, Patch, Body, Param, HttpStatus, UseGuards } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags('Playlist')
@UseGuards(JwtAuthGuard)
@Controller('playlist')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  // -------------------------------------------------------------------
  // 🔹 CREATE OR UPSERT PLAYLIST 
  // -------------------------------------------------------------------
  @Post('/create-playlist')
  async createOrUpdatePlaylist(@Body() createPlaylistDto: CreatePlaylistDto) {
    const playlist = await this.playlistService.createOrUpdatePlaylist(createPlaylistDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Playlist created or updated successfully',
      data: playlist, 
    };
  }
  

  // -------------------------------------------------------------------
  // 🔹 READ PLAYLIST (Get by user ID)
  // -------------------------------------------------------------------
  @Get('/find-playlist/:userId')
  @ApiOperation({ summary: 'Get playlist by user ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Playlist fetched successfully.' })
  async getPlaylist(@Param('userId') userId: string) {
    const playlist = await this.playlistService.getPlaylist(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Playlist fetched successfully',
      data: playlist,
    };
  }

  // -------------------------------------------------------------------
  // 🔹 UPDATE PLAYLIST MANUALLY
  // -------------------------------------------------------------------
  @Patch('/update/:userId')
  @ApiOperation({ summary: 'Update playlist manually' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Playlist updated successfully.' })
  async updatePlaylist(
    @Param('userId') userId: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    const updatedPlaylist = await this.playlistService.updatePlaylist(userId, updatePlaylistDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Playlist updated successfully',
      data: updatedPlaylist,
    };
  }
}
