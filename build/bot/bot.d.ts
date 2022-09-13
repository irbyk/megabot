import { Client, InteractionReplyOptions, VoiceBasedChannel, SelectMenuBuilder } from "discord.js";
import { PlexSong } from "../utils/plex/plex.js";
import { PlexAPIConfig } from "../utils/plex/plexAPI.js";
import { AudioResource } from "@discordjs/voice";
import EventEmitter from "events";
export declare enum BotEvent {
    Ready = "ready",
    Played = "played",
    Stopped = "stopped",
    Paused = "paused",
    Unpause = "unpause",
    Started = "started",
    SongLoaded = "songLoaded",
    ConnectedToVoiceChannel = "connectedToVoiceChannel",
    Skipped = "skipped"
}
export declare class Bot extends EventEmitter {
    private client;
    private plex;
    private song;
    private voiceConnection;
    private player;
    private playing;
    private paused;
    private initialized;
    private songQueue;
    private songInteraction;
    constructor(client: Client, plexConfig: PlexAPIConfig);
    isPlaying(): boolean;
    isPaused(): boolean;
    isInVocalChannel(): boolean;
    setInitialize(value: boolean): void;
    isInitialized(): boolean;
    start(botToken: string): Promise<void>;
    searchSong(songName: string): Promise<PlexSong>;
    searchSongs(songName: string): Promise<Song[]>;
    getSongInteraction(): Promise<InteractionReplyOptions>;
    loadSong(song: PlexSong): void;
    searchVoiceChannel(name: string): VoiceBasedChannel | undefined;
    connectToVoicChannel(voiceChannel: VoiceBasedChannel): void;
    play(): Promise<void>;
    testPlay(): Promise<void>;
    playSong(song: Song | undefined): Promise<void>;
    pause(): void;
    unpause(): void;
    skip(): void;
    stop(): void;
    destroy(): void;
    private generateSongInteraction;
    setSelectMenu(selectMenu: SelectMenuBuilder): Promise<InteractionReplyOptions>;
}
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
//# sourceMappingURL=bot.d.ts.map