"use strict"

const Discord = require('discord.js');
const client = new Discord.Client();

// Import configurations
const fs = require('fs');
const result = require('dotenv').config();

if (result.error) {
    console.log(result.error);
    throw error;
}

const EmojiCounter = require('./EmojiParser.js');
const Wiki = require("./wiki.js");
const EC = new EmojiCounter();

// Environment
const prefix = process.env.DISCORD_PREFIX;
const token = process.env.DISCORD_TOKEN;

client.login(token);

// Create command handler
// prefix, debug, bot object, commandDirectory="./commands"
const CommandHandler = require('./CommandHandler.js');
let CH = null;

client.on('ready', () => {
    CH = new CommandHandler(prefix, false, client);
    client.user.setPresence({game: {name: 'Magia Record | ;help'}})
        .then(console.log)
        .catch(console.error);
});

client.on('message', msg => {
    if (msg.channel.type !== 'text') return;
    if (msg.author.id == client.user.id) return;
    let parse = CH.handle(msg);
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
