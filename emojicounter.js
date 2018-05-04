"use strict";
let fs = require('fs');

class EmojiCounter {
    
    constructor() {
        this.emojiCount = {};
        this.countFile = "cfg/emojiCount.json";
        this.regex = /\<\:([\w]{2,})\:([\d]+)\>/g;
        this.undo = {};

        if(fs.existsSync("./" + this.countFile)) {
            console.log("Importing");
            let count = JSON.parse(fs.readFileSync("./" + this.countFile));
            //console.log(this.emojiCount);
            /* 
            for (let i in count) {
                this.emojiCount[i] = count[i];
            }
            // */
            
            this.emojiCount = count;

            //console.log(this.emojiCount);
        }
    }

    resetEmojiCount(server) {
        if (this.serverExists(server)) {
            this.undo[server.id] = this.emojiCount[server.id];
            for (let emojiID in this.emojiCount[server.id]) {
                this.emojiCount[server.id][emojiID] = 0;
            }
        } 
        exportData();
    }

    undoReset(server) {
        if (server.id in this.undo) {
            this.emojiCount[server.id] = this.undo[server.id];
            delete this.undo[server.id];
        }
    }

    importEmojiMapping(client) {
        this.emojiMap = client.emojis;
    }

    exportData() {
        //console.log("Exporting Data");
        fs.writeFileSync(`./${this.countFile}`, JSON.stringify(this.emojiCount));
    }

    printEmojiCount(server) {
        let e = this.getEmojiCount(server);
        let count = "";
        let counts = [];

        let sortedEmojis = server.emojis.sort((a, b) => {
            if (e[a.id] < e[b.id]) {
                return -1;
            } else if (e[a.id] > e[b.id]) {
                return 1;
            } else {
                return 0;
            }
        });
        
        sortedEmojis.map((emoji, emojiID, z) => { //for (let key in sortedEmojis) {
            //count += ${this.emojiMap.get(key)}
            let line = `${emoji}**:** ${e[emojiID]} \n`;
            if (line.length + count.length > 2000) {
                counts.push(count);
                count = "";
                //console.log(counts);
            }
            count += line;
        });
        if (count.length > 0) counts.push(count);

        return counts;
    }

    getEmojiCount(server) {
        if (server !== undefined) {
            return this.emojiCount[server.id];
        } else {
            return this.emojiCount;
        }
    }

    // Check existences
    emojiExists(server, emoji) {
        return emoji.id in this.emojiCount[server.id];
    }

    serverExists(server) {
        //console.log(server);
        return server.id in this.emojiCount;
    }

    // Adding new elements, needs server to access emoji list
    newServer(server) {
        this.emojiCount[server.id] = {};
        server.emojis.array().forEach((emoji) => {
            this.emojiCount[server.id][emoji.id] = 0;
        });
        //console.log("Populated " + server.name + "'s emojis");
    }

    newEmoji(server, emoji) {
        this.emojiCount[server.id][emoji.id] = 0;
    }

    updateEmojiCount(server, emoji, num) {
        this.emojiCount[server.id][emoji.id] += num;
        this.exportData();
    }

    // General entry into server check
    // Takes in a server, checks if it's in the database via ID, if it isn't,
    // add it. Mainly for multi-server use.
    serverCheck(server) {
        if(!this.serverExists(server)) {
            //console.log(`Initializing ${server.name}`);
            this.newServer(server);
            /*
            this.emojiCount[server] = {};
            server.emojis.array().forEach((emoji) => {
                console.log(emoji.name);
                this.emojiCount[server][emoji.name] = 0;
            });
            // */
        } 
    }

    parseMessage(message, server) {
        // Code based off of regex101.com
        let m;

        while((m = this.regex.exec(message.content)) !== null) {
            // Avoiding infinite loops
            if (m.index === this.regex.lastIndex) {
                regex.lastIndex++;
            }

            console.log(`${(new Date()).toLocaleString()} | ${m[1]} in ${server.name} by ${message.author.username} in ${message.channel.name}`);
            let emoji = server.emojis.get(m[2]);
            if (emoji !== undefined) {
                //let emojiID = m[2];
                if(!this.emojiExists(server, emoji)) {
                    this.emojiCount[server.id][emoji.id] = 0;
                }

                this.updateEmojiCount(server, emoji, 1);
            }
        }
    }
}

module.exports.EmojiCounter = EmojiCounter;

