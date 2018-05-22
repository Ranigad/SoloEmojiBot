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

// Environment
const prefix = process.env.DISCORD_PREFIX;
const token = process.env.DISCORD_TOKEN;

client.login(token);

// Create command handler
// prefix, debug, bot object, commandDirectory="./commands"
const CommandHandler = require('./CommandHandler.js');
let CH = null;

client.on('ready', () => {
    CH = new CommandHandler(prefix, true, client);
});

client.on('message', msg => {
    CH.handle(msg);
});