import { ChannelType, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } from "discord.js";
import { initializeCommand } from "../commands/command.js";
import { Plex } from "../utils/plex/plex.js";
import { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior } from "@discordjs/voice";
import fetch from "node-fetch";
import { Readable } from "stream";
import EventEmitter from "events";
export var BotEvent;
(function (BotEvent) {
    BotEvent["Ready"] = "ready";
    BotEvent["Played"] = "played";
    BotEvent["Stopped"] = "stopped";
    BotEvent["Paused"] = "paused";
    BotEvent["Unpause"] = "unpause";
    BotEvent["Started"] = "started";
    BotEvent["SongLoaded"] = "songLoaded";
    BotEvent["ConnectedToVoiceChannel"] = "connectedToVoiceChannel";
    BotEvent["Skipped"] = "skipped";
})(BotEvent || (BotEvent = {}));
export class Bot extends EventEmitter {
    client;
    plex;
    song;
    voiceConnection;
    player;
    playing;
    paused;
    initialized;
    songQueue;
    songInteraction;
    constructor(client, plexConfig) {
        super({ captureRejections: true });
        this.on('error', (error) => {
            console.log("Error throw on event handling with the bot.");
            console.error(error);
        });
        this.client = client;
        this.client.on('error', (error) => {
            console.log("Error throw on event handling with the client.");
            console.error(error);
        });
        this.plex = new Plex(plexConfig);
        this.player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        this.playing = false;
        this.paused = false;
        this.initialized = false;
        this.player.on(AudioPlayerStatus.Playing, () => {
            this.playing = true;
            this.paused = false;
            console.log("AudioPlayerStatus.Playing");
        });
        this.player.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });
        this.player.on("error", (error) => {
            console.log(`Audio player raise ${error}`);
            console.error(error);
        });
        this.player.on(AudioPlayerStatus.Idle, () => {
            this.paused = false;
            this.playing = false;
            this.song = undefined;
            if (this.songQueue.length > 0) {
                this.song = this.songQueue.shift();
                //this.playSong();
            }
            this.emit(BotEvent.Stopped);
            console.log("AudioPlayerStatus.Idle");
        });
        this.player.on(AudioPlayerStatus.Paused, () => {
            this.paused = true;
            console.log("AudioPlayerStatus.Paused");
        });
        this.player.on(AudioPlayerStatus.AutoPaused, () => {
            this.paused = true;
            console.log("AudioPlayerStatus.AutoPaused");
        });
        this.player.on(AudioPlayerStatus.Buffering, () => {
            this.paused = true;
            console.log("AudioPlayerStatus.Buffering");
        });
        this.songQueue = [];
    }
    isPlaying() {
        return this.playing;
    }
    isPaused() {
        return this.paused;
    }
    isInVocalChannel() {
        return this.voiceConnection !== undefined &&
            !(this.voiceConnection.state.status === VoiceConnectionStatus.Disconnected ||
                this.voiceConnection.state.status === VoiceConnectionStatus.Destroyed);
    }
    setInitialize(value) {
        if (!this.initialized && value) {
            this.initialized = value;
            this.emit(BotEvent.Ready);
        }
        else {
            throw new Error("The bot is already initialized.");
        }
    }
    isInitialized() {
        return this.initialized;
    }
    async start(botToken) {
        if (!this.initialized) {
            throw new Error("Should be initialize before start.");
        }
        console.dir(initializeCommand);
        await this.client.login(botToken);
        this.emit(BotEvent.Started);
    }
    async searchSong(songName) {
        return (await this.plex.getSongsFromName(songName))[0];
    }
    async getSongInteraction() {
        if (this.songInteraction === undefined) {
            throw new Error("No song interaction has been created.");
        }
        return this.songInteraction;
    }
    loadSong(song) {
        if (this.song === undefined) {
            this.song = new Song(song);
        }
        else {
            this.songQueue.push(new Song(song));
        }
        this.emit(BotEvent.SongLoaded, this.song);
    }
    searchVoiceChannel(name) {
        return this.client.channels.cache.find(channel => channel.type === ChannelType.GuildVoice && channel.name === name);
    }
    connectToVoicChannel(voiceChannel) {
        this.voiceConnection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        this.voiceConnection.subscribe(this.player);
        this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
            console.log('Disconnected from vocal channel.');
        });
        this.voiceConnection.on(VoiceConnectionStatus.Signalling, () => {
            if (!this.isPlaying())
                return;
            this.voiceConnection?.rejoin(this.voiceConnection.joinConfig);
        });
        this.voiceConnection.on("error", (error) => {
            console.log(`voiceConnection raise ${error}`);
            console.error(error);
        });
        this.voiceConnection.on('debug', console.log);
        const voiceChannelName = voiceChannel.name;
        const handlerDisconnectTest = (oldState, newState) => {
            // console.dir(newState, {depth: 5});
            console.log(`voiceConnection transitioned from ${oldState.status} to ${newState.status}`);
            if (newState.status === 'signalling' && oldState.status === newState.status) {
                this.voiceConnection?.removeListener("stateChange", handlerDisconnectTest);
                console.log("Disconnect");
                this.voiceConnection?.disconnect();
                console.log("Destroy");
                this.voiceConnection?.destroy();
                console.log("Reconnect");
                const voiceChannelReco = this.searchVoiceChannel(voiceChannelName);
                if (voiceChannelReco === undefined) {
                    throw new Error(`The voice channel "${voiceChannelName}" cannot be find.`);
                }
                this.connectToVoicChannel(voiceChannelReco);
            }
        };
        this.voiceConnection.on("stateChange", handlerDisconnectTest);
        this.emit(BotEvent.ConnectedToVoiceChannel, voiceChannel);
    }
    async play() {
        if (this.voiceConnection === undefined) {
            throw new Error("The bot is not connected to a voice channel");
        }
        if (this.playing) {
            throw new Error("The bot is already playing.");
        }
        await this.playSong();
        this.emit(BotEvent.Played);
    }
    async testPlay() {
        if (this.voiceConnection === undefined) {
            throw new Error("The bot is not connected to a voice channel");
        }
        // if (this.playing) {
        // 	throw new Error("The bot is already playing.");
        // }
        const audioRessourceTest = createAudioResource("test.mp3");
        this.player.on('debug', console.log);
        this.player.on('error', console.error);
        this.player.play(audioRessourceTest);
        this.emit(BotEvent.Played);
    }
    async playSong() {
        if (this.song === undefined) {
            throw new Error("No song to be played.");
        }
        await this.song.load();
        if (this.song.loaded) {
            this.songInteraction = await this.generateSongInteraction(this.song);
            this.player.play(this.song.ressource);
        }
    }
    pause() {
        if (this.playing) {
            if (this.player.pause(true)) {
                //this.paused = true;
                return;
            }
            throw new Error("The bot cannot be paused for unknow reason.");
        }
        throw new Error("The bot cannot be paused because it is not playing.");
    }
    unpause() {
        if (this.paused) {
            if (this.player.unpause()) {
                return;
            }
            throw new Error("The bot cannot be unpaused for unknown reason.");
        }
        throw new Error("The bot cannot be unpaused because it is not paused.");
    }
    skip() {
        const songSkipped = this.song;
        this.player.stop();
        this.emit(BotEvent.Skipped, songSkipped);
    }
    stop() {
        this.songQueue = [];
        this.player.stop();
    }
    destroy() {
        this.client.destroy();
    }
    async generateSongInteraction(song, isPaused = false) {
        try {
            const imageResponse = await fetch(song.pictureURL);
            const imageBuffer = await imageResponse.arrayBuffer();
            const row = new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setCustomId('playButton')
                .setLabel(isPaused ? 'Resume' : 'Pause')
                .setStyle(ButtonStyle.Success), new ButtonBuilder()
                .setCustomId('stopButton')
                .setLabel('Stop')
                .setStyle(ButtonStyle.Danger));
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`${song.title}`)
                .setDescription(`Artist : ${song.artist}\n Album : ${song.album}`)
                .setImage('attachment://cover.jpg');
            const buttonPlayHandler = async (interaction) => {
                if (!interaction.isButton())
                    return;
                if (interaction.customId === 'playButton') {
                    console.log(interaction.message.components[0].components[0]);
                    if (this.isPaused()) {
                        this.unpause();
                        //await interaction.deferUpdate();
                        const songInteraction = await this.generateSongInteraction(song, false);
                        await interaction.update({
                            components: songInteraction.components,
                        });
                    }
                    else {
                        this.pause();
                        //await interaction.deferUpdate();
                        const songInteraction = await this.generateSongInteraction(song, true);
                        await interaction.update({
                            components: songInteraction.components,
                        });
                    }
                    this.client.removeListener('interactionCreate', buttonPlayHandler);
                }
                // console.log(interaction);
            };
            this.client.on('interactionCreate', buttonPlayHandler);
            const stopButtonHandler = async (interaction) => {
                if (!interaction.isButton())
                    return;
                if (interaction.customId === 'stopButton') {
                    this.stop();
                    await interaction.update({
                        content: 'The bot has been stop.',
                        components: [],
                    });
                    this.client.removeListener('interactionCreate', buttonPlayHandler);
                }
            };
            this.client.on('interactionCreate', stopButtonHandler);
            return {
                content: `Artist : ${song.artist}, album : ${song.album}, title: ${song.title}`,
                embeds: [embed],
                components: [row],
                files: [{
                        attachment: Buffer.from(imageBuffer),
                        name: "cover.jpg"
                    }],
            };
        }
        catch (err) {
            console.error(err);
            return {
                content: `Artist : ${song.artist}, album : ${song.album}, title: ${song.title}.\n`
                    + 'An error occured when generating this message.',
            };
        }
    }
}
export class Song {
    album;
    artist;
    key;
    title;
    url;
    ressource;
    loaded;
    pictureURL;
    constructor(song) {
        this.album = song.album;
        this.artist = song.artist;
        this.key = song.key;
        this.title = song.title;
        this.url = song.url;
        this.loaded = false;
        this.pictureURL = song.pictureURL;
    }
    /**
     * Load the song from the plex server. On ce song is loaded the attribute loaded will be set to true.
     */
    async load() {
        if (this.loaded)
            return;
        const response = await fetch(this.url);
        if (response.body === null)
            throw new Error(`"${this.url} is empty."`);
        const readstream = Readable.from(response.body, { highWaterMark: 20971520 });
        this.ressource = createAudioResource(readstream);
        this.loaded = true;
    }
}
//# sourceMappingURL=bot.js.map