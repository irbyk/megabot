import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
export class InteractionSong {
    content;
    embeds;
    components;
    files;
    song;
    constructor() {
        this.content = `Hi !`;
    }
    addSong(song) {
        this.content = `Artist : ${song.artist}, album : ${song.album}, title: ${song.title}`;
        this.song = song;
    }
    generateButtons(isPaused = false) {
        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setCustomId('playButton')
            .setLabel(isPaused ? 'Resume' : 'Pause')
            .setStyle(ButtonStyle.Success), new ButtonBuilder()
            .setCustomId('stopButton')
            .setLabel('Stop')
            .setStyle(ButtonStyle.Danger));
        return [row];
    }
    generateEmbeds() {
        if (this.song === undefined)
            throw new Error('No song attached to the interaction.');
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`${this.song.title}`)
            .setDescription(`Artist : ${this.song.artist}\n Album : ${this.song.album}`)
            .setImage('attachment://cover.jpg');
        return [embed];
    }
    async generateFile() {
        if (this.song === undefined)
            throw new Error('No song attached to the interaction.');
        const imageResponse = await fetch(this.song.pictureURL);
        const imageBuffer = await imageResponse.arrayBuffer();
        return [{
                attachment: Buffer.from(imageBuffer),
                name: "cover.jpg"
            }];
    }
    async init() {
        if (this.song === undefined)
            throw new Error('No song attached to the interaction.');
        this.embeds = this.generateEmbeds();
        this.components = this.generateButtons();
        this.files = await this.generateFile();
        return this;
    }
}
//# sourceMappingURL=interaction_song.js.map