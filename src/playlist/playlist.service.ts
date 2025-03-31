import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
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
  // async createPlaylist(createPlaylistDto: CreatePlaylistDto): Promise<iPlaylist> {
  //   const newPlaylist = new this.playlistModel(createPlaylistDto);
  //   newPlaylist.recommendedBooks = await this.generateRecommendations(
  //     createPlaylistDto.categories,
  //     createPlaylistDto.authors,
  //   );
  //   return newPlaylist.save();
  // }

  // // Update an existing playlist for a user based on their preferences
  // async updatePlaylist(userId: string, updatePlaylistDto: UpdatePlaylistDto): Promise<Playlist> {
  //   const playlist = await this.playlistModel.findOne({ user: userId });
  //   if (!playlist) {
  //     throw new NotFoundException('Playlist not found for this user.');
  //   }
  //   if (updatePlaylistDto.categories) {
  //     playlist.categories = updatePlaylistDto.categories;
  //   }
  //   if (updatePlaylistDto.authors) {
  //     playlist.authors = updatePlaylistDto.authors;
  //   }
  //   playlist.recommendedBooks = await this.generateRecommendations(
  //     playlist.categories,
  //     playlist.authors,
  //   );
  //   return playlist.save();
  // }

  // // Retrieve a user's playlist
  // async getPlaylist(userId: string): Promise<iPlaylist> {
  //   const playlist = await this.playlistModel.findOne({ user: userId });
  //   if (!playlist) {
  //     throw new NotFoundException('Playlist not found for this user.');
  //   }
  //   return playlist;
  // }

  // // Generate recommended books based on selected categories and authors
  // async generateRecommendations(categories: string[], authors: string[]): Promise<any[]> {
  //   let recommendations = [];

  //   // For each category, fetch a few random books (e.g., 3 per category)
  //   for (const category of categories) {
  //     const books = await this.bookService.findRandomBooksByCategory(category, 3);
  //     recommendations = recommendations.concat(books);
  //   }

  //   // For each author, fetch a few popular books (e.g., 3 per author)
  //   for (const author of authors) {
  //     const books = await this.bookService.findPopularBooksByAuthor(author, 3);
  //     recommendations = recommendations.concat(books);
  //   }

  //   // Remove duplicate books based on their _id and shuffle the array
  //   const uniqueBooks = Array.from(new Set(recommendations.map(book => book._id.toString())))
  //     .map(id => recommendations.find(book => book._id.toString() === id));
  //   uniqueBooks.sort(() => Math.random() - 0.5);

  //   return uniqueBooks;
  // }

  // // Optionally, update all playlists periodically (e.g., via a cron job)
  // async updateAllPlaylists(): Promise<void> {
  //   const playlists = await this.playlistModel.find();
  //   for (const playlist of playlists) {
  //     playlist.recommendedBooks = await this.generateRecommendations(
  //       playlist.categories,
  //       playlist.authors,
  //     );
  //     await playlist.save();
  //   }
  // }
}
