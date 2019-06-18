"use strict"

const Discord = require('discord.js');
const client = new Discord.Client();

// Import configurations
const fs = require('fs');
const result = require('dotenv').config();

if (result.error) {
    console.log(result.error);
    throw result.error;
}

import {EmojiParser} from "./EmojiParser";
import {Wikia} from "./wiki";
const EC = new EmojiParser();
import * as Util from "./Util";
import * as TranslationHandler from "./TranslationHandler";

// Environment
const prefix = process.env.DISCORD_PREFIX;
const token = process.env.DISCORD_TOKEN;

client.login(token);

// Create command handler
// prefix, debug, bot object, commandDirectory="./commands"
import {CommandHandler} from "./CommandHandler";
let CH = null;

import {SupportsManager} from "./SupportsManager";
let SM = null;

client.on('ready', () => {

    SM = new SupportsManager();
    client.supportsManager = SM;
    SM.bot = client;

    CH = new CommandHandler(prefix, false, client);
    client.user.setPresence({game: {name: 'Magia Record | ;help'}})
        .then(console.log)
        .catch(console.error);
    
    let normal = [], animated = [];
    client.guilds.get("471030229629009925").emojis.forEach(emoji => emoji.animated ? animated.push([emoji.id, emoji.name]) : normal.push([emoji.id, emoji.name]));

    let message = "Static Emojis";
    normal.forEach(emoji => message += `\n<:${emoji[1]}:${emoji[0]}> -- ${emoji[1]}, ${emoji[0]}`);
    message += "\nAnimated Emojis";
    animated.forEach(emoji => message += `\n<a:${emoji[1]}:${emoji[0]}> -- ${emoji[1]}, ${emoji[0]}`);
    console.log(message);

    //client.guilds.get("471030229629009925").channels.get("494359317638807572").send(message);
});

client.on('message', async msg => {
    if (msg.channel.type !== 'text') return;
    if (msg.author.id == client.user.id) return;
    if (msg.author.bot == false && !msg.channel.name.includes("art")) {
        TranslationHandler.process_data(msg);
    }
    let parse = await CH.handle(msg);
    if (parse && msg.author.bot == false) {
        EC.parseMessage(msg);
    }
});

client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot == true) return;
    let emoji = reaction.emoji;
    let server = reaction.message.guild;
    console.log(`${(new Date()).toLocaleString()} | Reaction | ${emoji.name} in ${server.name} by ${user.username} in ${reaction.message.channel.name}`);   // Logging
    EC.dbadd(emoji.name, emoji.id, user.username, user.id, server.name, server.id, 1, reaction.message.id);
});

client.on('messageReactionRemove', (reaction, user) => {
    if (user.bot == true) return;
    let emoji = reaction.emoji;
    let server = reaction.message.guild;
    console.log(`${(new Date()).toLocaleString()} | Remove Reaction | ${emoji.name} in ${server.name} by ${user.username} in ${reaction.message.channel.name}`);   // Logging
    EC.dbremove(emoji.name, user.id, server.id, 1, reaction.message.id);
});
