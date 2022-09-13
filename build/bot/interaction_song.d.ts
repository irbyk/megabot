/// <reference types="node" />
import { ActionRowBuilder, APIAttachment, Attachment, AttachmentBuilder, AttachmentPayload, BufferResolvable, ButtonBuilder, EmbedBuilder, InteractionReplyOptions, JSONEncodable } from 'discord.js';
import { Stream } from 'stream';
import { Song } from './song.js';
export declare class InteractionSong implements InteractionReplyOptions {
    content: string;
    embeds?: EmbedBuilder[];
    components?: ActionRowBuilder<ButtonBuilder>[];
    files?: (BufferResolvable | Stream | JSONEncodable<APIAttachment> | Attachment | AttachmentBuilder | AttachmentPayload)[] | undefined;
    song?: Song;
    constructor();
    addSong(song: Song): void;
    generateButtons(isPaused?: boolean): ActionRowBuilder<ButtonBuilder>[];
    generateEmbeds(): EmbedBuilder[];
    init(): Promise<InteractionSong>;
}
//# sourceMappingURL=interaction_song.d.ts.map