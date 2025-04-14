import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException, forwardRef, Inject, ConflictException } from '@nestjs/common';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { Model, Document } from 'mongoose';
import { iPlaylist } from './interface/playlist.interface';
import { BookService } from 'src/book/book.service';

@Injectable()
export class PlaylistService {
  constructor(
    @InjectModel('Playlist')
    private readonly playlistModel: Model<iPlaylist>,
    @Inject(forwardRef(() => BookService))
    private readonly bookService: BookService,
  ) {}

  async findPlaylist(userId: string): Promise<iPlaylist | null> {
    return this.playlistModel.findOne({ user: userId });
  }

  // -------------------------------------------------------------------
  // 🔸 CREATE
  // -------------------------------------------------------------------
  async createPlaylist(createPlaylistDto: CreatePlaylistDto): Promise<iPlaylist> {
    const existing = await this.findPlaylist(createPlaylistDto.user.toString());
    if (existing) {
      throw new ConflictException('Playlist already exists.');
    }

    const newPlaylist = new this.playlistModel(createPlaylistDto);
    newPlaylist.recommendedBooks = await this.generateRecommendations(
      createPlaylistDto.categories,
      createPlaylistDto.authors,
    );
    return newPlaylist.save();
  }

  // -------------------------------------------------------------------
  // 🔸 CREATE OR UPDATE
  // -------------------------------------------------------------------
  async createOrUpdatePlaylist(createPlaylistDto: CreatePlaylistDto): Promise<iPlaylist> {
    const existing = await this.findPlaylist(createPlaylistDto.user.toString());

    if (!existing) {
      return this.createPlaylist(createPlaylistDto);
    }

    return this.updatePlaylist(createPlaylistDto.user.toString(), {
      categories: createPlaylistDto.categories,
      authors: createPlaylistDto.authors,
    });
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE
  // -------------------------------------------------------------------
  async updatePlaylist(userId: string, updatePlaylistDto: UpdatePlaylistDto): Promise<iPlaylist> {
    const playlist = await this.playlistModel.findOne({ user: userId }) as Document & iPlaylist;

    if (!playlist) {
      throw new NotFoundException('Playlist not found for this user.');
    }

    playlist.categories = updatePlaylistDto.categories || playlist.categories;
    playlist.authors = updatePlaylistDto.authors || playlist.authors;
    playlist.recommendedBooks = await this.generateRecommendations(
      playlist.categories,
      playlist.authors,
    );

    return playlist.save();
  }

  // -------------------------------------------------------------------
  // 🔸 READ
  // -------------------------------------------------------------------
  async getPlaylist(userId: string): Promise<iPlaylist> {
    const playlist = await this.playlistModel.findOne({ user: userId });
    if (!playlist) {
      throw new NotFoundException('Playlist not found for this user.');
    }
    return playlist;
  }

  // -------------------------------------------------------------------
  // 🔸 RECOMMENDATIONS
  // -------------------------------------------------------------------
  public async generateRecommendations(categories: string[], authors: string[]): Promise<any[]> {
    const recommendations = await Promise.all([
      ...categories.map(category => this.safeFindRandomBooksByCategory(category)),
      ...authors.map(author => this.safeFindPopularBooksByAuthor(author)),
    ]);

    const flattenedRecommendations = recommendations.flat();
    const uniqueBooks = Array.from(new Map(flattenedRecommendations.map(book => [book._id.toString(), book])).values());

    uniqueBooks.sort((a, b) => b.view - a.view);        
    return uniqueBooks;
  }

  private async safeFindRandomBooksByCategory(category: string) {
    try {
      return await this.bookService.findRandomBooksByCategory(category);
    } catch (error) {
      return [];
    }
  }

  private async safeFindPopularBooksByAuthor(author: string) {
    try {
      return await this.bookService.findPopularBooksByAuthor(author);
    } catch (error) {
      return [];
    }
  }

  // -------------------------------------------------------------------
  // 🔸 UPDATE ALL PLAYLISTS
  // -------------------------------------------------------------------
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
