import { Client, InteractionReplyOptions, VoiceBasedChannel, SelectMenuBuilder } from "discord.js";
import { PlexSong } from "../utils/plex/plex.js";
import { PlexAPIConfig } from "../utils/plex/plexAPI.js";
import EventEmitter from "events";
import { Song } from "./song.js";
import { Queue } from "./queue.js";
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
    getQueue(): Queue;
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
    getClient(): Client;
    generateSongInteraction(song: PlexSong, isPaused?: boolean): Promise<InteractionReplyOptions>;
    setSelectMenu(selectMenu: SelectMenuBuilder): Promise<InteractionReplyOptions>;
}
//# sourceMappingURL=bot.d.ts.map