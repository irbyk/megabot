import { ActionRowBuilder,  APIAttachment,  Attachment,  AttachmentBuilder,  AttachmentPayload,  BufferResolvable,  ButtonBuilder, ButtonStyle, EmbedBuilder, InteractionReplyOptions, JSONEncodable } from 'discord.js';
import { Stream } from 'stream';
import { Song } from './bot.js';

export class InteractionSong implements InteractionReplyOptions {
	
	public content: string;
	public embeds?: EmbedBuilder[];
	public components?: ActionRowBuilder<ButtonBuilder>[]
	public files?: (BufferResolvable | Stream | JSONEncodable<APIAttachment> | Attachment | AttachmentBuilder | AttachmentPayload)[] | undefined;
	public song?: Song

	constructor() {
		this.content =  `Hi !`;
	}

	public addSong(song: Song) {
		this.content = `Artist : ${song.artist}, album : ${song.album}, title: ${song.title}`;
		this.song = song;
	}

	public generateButtons(isPaused = false): ActionRowBuilder<ButtonBuilder>[] {
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('playButton')
					.setLabel(isPaused ? 'Resume' : 'Pause')
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('stopButton')
					.setLabel('Stop')
					.setStyle(ButtonStyle.Danger),
			);
		return [row];
	}

	public generateEmbeds(): EmbedBuilder[] {
		if (this.song === undefined) throw new Error('No song attached to the interaction.');
		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(`${this.song.title}`)
			.setDescription(`Artist : ${this.song.artist}\n Album : ${this.song.album}`)
			.setImage('attachment://cover.jpg');
		return [embed];
	}

	// public async generateFile(): Promise<AttachmentPayload[]>{
	// 	if (this.song === undefined) throw new Error('No song attached to the interaction.');
	// 	const imageResponse = await fetch(this.song.pictureURL);
	// 	const imageBuffer = await imageResponse.arrayBuffer();
	// 	return [{
	// 		attachment: Buffer.from(imageBuffer),
	// 		name: "cover.jpg"
	// 	}]
	// }

	public async init(): Promise<InteractionSong> {
		if (this.song === undefined) throw new Error('No song attached to the interaction.');
		this.embeds = this.generateEmbeds();
		this.components = this.generateButtons();
		// this.files = await this.generateFile();
		return this;
	}

}