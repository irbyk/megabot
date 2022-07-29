import { PlexAPIConfig } from "./plex/plexAPI.js";
export interface Config {
    listen_channel: string;
    command_character: string;
    playlist_directory: string;
    language: string;
}
export interface Key {
    botToken: string;
}
export declare function loadConfig(): Promise<Config>;
export declare function loadKey(): Promise<Key>;
export declare function loadConfigPlex(): Promise<PlexAPIConfig>;
//# sourceMappingURL=config.d.ts.map