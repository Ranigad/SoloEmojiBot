"use strict";
// Discord
const Discord = require("discord.js");
const client = new Discord.Client();

// Websocket

// File open
const fs = require("fs");
const result = require("dotenv").config();

if (result.error) {
    console.log(result.error);
    throw error;
}

// Modules
const EmojiCounter = require("./emojicounter.js");
const Wikia = require("./wikia.js");
const spawn = require('child_process').spawn
//let py = spawn('python3', ['twitterbot.py'], { stdio: 'pipe' });

// Client

// Config
//const { prefix, token } = require(process.argv[2]);
const prefix = process.env.DISCORD_PREFIX;
const token = process.env.DISCORD_TOKEN;

// Creating the emojicounter
var ec = new EmojiCounter.EmojiCounter();
let wiki = new Wikia.Wikia();
let newsChannel = null;
let ranigad = null;

// Helper functions
const clean = text => {
    if (typeof(text) === 'string')
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    else
        return text;
}

// Twitter Stuff -> Get User from name, listen on stream and post message

let run_tweet_collector = (newsChannel, timeout) => {

    let py = spawn('python3', ['twitterbot.py'], { stdio: 'pipe' });
    py.stdout.on('data', function(buffer) {
        let tweet = buffer.toString('utf8');
        console.log("Child Data");
        newsChannel.send(tweet);
    });

    py.stdout.on('close', function(code) {
        ranigad.send(`Twitter Stream disconnected: ${code}`);
        if(timeout > 10*60*1000){
            ranigad.send('Timeout limit exceeded, closing twitterbot');
            return;
        }
        console.log(`Stream disconnected, restarting after ${timeout/1000} seconds`);
        setTimeout(run_tweet_collector, timeout, newsChannel, 2*timeout);
        //run_tweet_collector(newsChannel, 2*timeout);
    });

    py.stderr.on('data', (data) => {
        console.log(`Error: ${data}`);
        ranigad.send(`Twitter Error: ${data}`);
    });
}



client.on('ready', () => {
    ranigad = client.users.get("100760838754824192");
    ranigad.send("Bot Online!");
    console.log("Connection Established");
    ec.importEmojiMapping(client);
    newsChannel = client.channels.get("350292579662954496");
    run_tweet_collector(newsChannel, 1000);
    /*
    py.stdout.on('data', function(buffer) {
        let tweet = buffer.toString('utf8');
        console.log("Child Data");
        newsChannel.send(tweet);
    });

    py.stdout.on('close', function(code) {
        ranigad.send(`Twitter Stream disconnected: ${code}`);
        console.log(`Stream disconnected`);
        //run_tweet_collector();
    });

    py.stderr.on('data', (data) => {
        console.log(`Error: ${data}`);
        ranigad.send(`Twitter Error: ${data}`);
    });
    // */

});

var serverCheck = function(server) {
    if(!(serverExists(server))) {
        console.log(`Initializing ${server.name}`);
        populateServerEmojis(server);
        /*
        emojiCount[server] = {};
        server.emojis.array().forEach((emoji) => {
            console.log(emoji.name);
            emojiCount[server][emoji.name] = 0;
        });
        // */
    } 
}

client.on('message', msg => {

    let content = msg.content;
    let server = msg.guild;
    let channel = msg.channel;
    
    // Display Data
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // DM Message
    if (channel.type === "dm" && msg.author.id === ranigad.id && command === "eval") {
        console.log("Eval");
        try {
            const code = args.join(" ");
            let evaled = eval(code);

            if (typeof(evaled) !== "string")
                evaled = require("util").inspect(evaled);

            msg.channel.send(clean(evaled), {code:"xl"});
        } catch (err) {
            msg.channel.send(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``);
        }
    } 
    
    if (channel.type !== "text") {
        ranigad.send(`Invalid Channel | ${channel.type} | ${msg.author.id} | ${command}`);
        //ranigad.send(`Type: ${channel.type === "dm"} | ID: ${msg.author.id === ranigad.id} | Command: ${command === "eval"}`);
        return;
    }

    // If server isn't in the database, add the server and populate its emojis.
    ec.serverCheck(server);
   
    ec.parseMessage(msg, server);

    let retort = `Error, invalid command provided. Please enter ${prefix}help to see a list of commands`;
    if (command === "emoji") {
        let emojistats = ec.printEmojiCount(server);
        for (let i = 0; i < emojistats.length; i++) {
            console.log("Printing");
            console.log(emojistats[i]);
            msg.channel.send({embed: {
                "color": 15105570,
                "author": {
                    "name": "Emoji List"
                },
                "footer": {
                    "text": "React with a regional_indicator_x emote to remove"
                },
                "description": `${emojistats[i]}`
            }});
        }
        ec.exportData();

        return;
    } else if (command === "emojiReset") {
    } else if (command === "wset") {
        if(args.length != 1) {
            retort = "Wikia set must be done with a single word.";   
        } else { 
            wiki.setWikia(server, args[0]);
            retort = `Wikia set! <http://${wiki.linkWikia(server, [])}>`;
        }
    } else if (command === "wlink" || command == "w") {
        let link = wiki.linkWikia(server, args);
        if (link == -1) {
            retort = "This server does not have an associated wikia";
        } else {
            retort = `<http://${link}>`;
        }
    } else if (command === "wadd") {
        if(args.length < 2) {
            retort = "Adding a custom link requires a nickname and a target page!";
        } else {
            wiki.customWikiaAdd(server, args.shift(), args);
            retort = "New shortcut set!";
        }
    } else if (command === "wdelete") {
        if (args.length != 1) {
            retort = "Please only provide the name of the shortcut you want to delete!";
        } else if (wiki.customWikiaDelete(server, args[0]) == -1) {
            retort = "This nickname does not exist!";
        } else {
            retort = "Nickname deleted";
        } 
    } else if (command === "wreset") {
    } else if (command === "help" && (msg.channel.name === "bot-commands" || msg.channel.name === "bots-troubleshooting")) {
        console.log(`${msg.channel.id}`);

        msg.channel.send({
          "embed": {
            "title": "Commands and Arguments",
            "description": "A list of commands and their expected arguments.",
        "color": 15105570,
            "fields": [
/*              {
                "name": "emoji",
                "value": "Prints a list of the server emojis and their tracked usage."
              },
*/              {
                "name": "wset",
                "value": "Given a single word, sets an associated wikia name for the server."
              },
              {
                "name": "wlink",
                "value": "Given a string, links the server's linked wikia and the correct page."
              },
              {
                "name": "wadd",
                "value": "Given a keyword and a page destination, creates a shortcut link. The keyword must be a single word and can be linked via wlink."
              },
              {
                "name": "wdelete",
                "value": "Given a keyword, deletes an existing shortcut link established via wdelete."
              }
            ]
          }
        });
        return;
    } else {
        retort = undefined;
    }

    if (retort !== undefined) {
        msg.channel.send(retort);
        console.log(`${(new Date()).toLocaleString()} | ${msg.channel.guild.name}-${msg.channel.name}-${msg.author.username}`)
    }
});

client.on('messageReactionAdd', (msgReaction, user) => {
    let emoji = msgReaction.emoji;
    let server = msgReaction.message.guild;

    if (msgReaction.message.author == client.user && emoji == "🇽") {
        msgReaction.message.delete();
    } else {

        ec.serverCheck(server);
        
        if ((server.emojis.array().filter(e => e.id == emoji.id)).length > 0) {
        
            console.log(`${(new Date()).toLocaleString()} | Reaction ${emoji.name} in ${server.name} by ${user.username}`);
            if(!ec.emojiExists(server, emoji)) {
                ec.newEmoji(server, emoji);
            }
            
            ec.updateEmojiCount(server, emoji, 1);
            //socket.emit('emoji', emojiName);
        }
    }
});

client.on('messageReactionRemove', (msgReaction, user) => {
    let emoji = msgReaction.emoji;
    let server = msgReaction.message.guild;

    if ((server.emojis.array().filter(e => e.id == emoji.id)).length > 0) {
        
        console.log(`${(new Date()).toLocaleString()} | Reaction Removed ${emoji.name} in ${server.name} by ${user.username}`);
        //console.log(`Reaction removed. ${emoji.name} in ${server.name}`);
        ec.serverCheck(server);
        if(!ec.emojiExists(server, emoji)) {
            ec.newEmoji(server, emoji);
        }
        
        ec.updateEmojiCount(server, emoji, -1);
        //socket.emit('emojiRemove', emojiName);
    }
});

client.on('error', (err) => {
    console.log(`Discordjs Error: ${err.toString()}`);

});

//var fileName = process.argv[2];
client.login(token);
