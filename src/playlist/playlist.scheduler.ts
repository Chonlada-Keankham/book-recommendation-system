import { Cron } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { PlaylistService } from './playlist.service';

@Injectable()
export class PlaylistScheduler {
    constructor(
        private readonly playlistService: PlaylistService,
    ) { }

    @Cron('0 0 * * *')
    async handleCron() {
        await this.playlistService.updateAllPlaylists();
    }
}
