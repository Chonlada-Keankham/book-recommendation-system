import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Model } from 'mongoose';
import { iPlaylist } from './interface/playlist.interface';
import { BookService } from 'src/book/book.service';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectModel('Playlist')
    private readonly playlistModel: Model<iPlaylist>,
    private readonly bookService: BookService,

  ) {
  }
  async createPlaylist(createPlaylistDto: CreatePlaylistDto): Promise<iPlaylist> {
    const newPlaylist = new this.playlistModel(createPlaylistDto);
    newPlaylist.recommendedBooks = await this.generateRecommendations(
      createPlaylistDto.categories,
      createPlaylistDto.authors,
    );
    return newPlaylist.save();
  }

  async updatePlaylist(userId: string, updatePlaylistDto: UpdatePlaylistDto): Promise<iPlaylist> {
    const playlist = await this.playlistModel.findOne({ user: userId });
    if (!playlist) {
      throw new NotFoundException('Playlist not found for this user.');
    }
    if (updatePlaylistDto.categories) {
      playlist.categories = updatePlaylistDto.categories;
    }
    if (updatePlaylistDto.authors) {
      playlist.authors = updatePlaylistDto.authors;
    }
    playlist.recommendedBooks = await this.generateRecommendations(
      playlist.categories,
      playlist.authors,
    );
    return playlist.save();
  }

  async getPlaylist(userId: string): Promise<iPlaylist> {
    const playlist = await this.playlistModel.findOne({ user: userId });
    if (!playlist) {
      throw new NotFoundException('Playlist not found for this user.');
    }
    return playlist;
  }

async generateRecommendations(categories: string[], authors: string[]): Promise<any[]> {
  let recommendations = [];

  for (const category of categories) {
    const books = await this.bookService.findRandomBooksByCategory(category, 3);
    recommendations = recommendations.concat(books);
  }

  for (const author of authors) {
    const books = await this.bookService.findPopularBooksByAuthor(author, 3);
    recommendations = recommendations.concat(books);
  }

  const uniqueBooks = Array.from(new Set(recommendations.map(book => book._id.toString())))
    .map(id => recommendations.find(book => book._id.toString() === id));

  uniqueBooks.sort(() => Math.random() - 0.5);

  return uniqueBooks.slice(0, 20);
}

  async updateAllPlaylists(): Promise<void> {
    const playlists = await this.playlistModel.find();
    for (const playlist of playlists) {
      playlist.recommendedBooks = await this.generateRecommendations(
        playlist.categories,
        playlist.authors,
      );
      await playlist.save();
    }
  }
}
