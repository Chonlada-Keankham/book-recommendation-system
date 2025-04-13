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
  constructor(private readonly playlistService: PlaylistService) { }

  // ---------- Create ----------
  @Post('/create-playlist')
  @ApiOperation({ summary: 'Create a new playlist' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Playlist created successfully.' })
  async createPlaylist(@Body() createPlaylistDto: CreatePlaylistDto) {
    const playlist = await this.playlistService.createPlaylist(createPlaylistDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Playlist created successfully',
      data: playlist,
    };
  }

  // ---------- Read ----------
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

  // ---------- Update ----------
  @Patch('/update/:userId')
  @ApiOperation({ summary: 'Update playlist for a user' })
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