import { AudioResource } from "@discordjs/voice";
import { PlexSong } from "../utils/plex/plex.js";
export interface SongJSON {
    album: string;
    artist: string;
    key: string;
    mediaKey: string;
    title: string;
    pictureKey: string;
}
export declare class Song implements PlexSong {
    album: string;
    artist: string;
    key: string;
    mediaKey: string;
    title: string;
    ressource: AudioResource | undefined;
    loaded: boolean;
    pictureKey: string;
    constructor(song: PlexSong);
    toJSON(): SongJSON;
    static fromJSON(songJSON: SongJSON): PlexSong;
}
//# sourceMappingURL=song.d.ts.map