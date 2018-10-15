"use strict";

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
module.exports = class EmojiParser {

    constructor() {
        this.regex = /\<a?\:([\w]{2,})\:([\d]+)\>/g;
        this._dbname = "emojis.db";
        this._dbpath = "./data/"
        this._tablename = "emoji";  // time, emoji name, emoji id, user, actual emoji
        this._embedlength = 1500;
        //this._client = client;

        this.db = new sqlite3.Database(`${this._dbpath}${this._dbname}`);
        this.db.run(`CREATE TABLE IF NOT EXISTS ${this._tablename} (emojiid TEXT, emojiname TEXT, userid TEXT, username TEXT, serverid TEXT, servername TEXT, reaction INTEGER, time INTEGER, messageid TEXT)`, [], (err, rows) => {
            /*if (err) {
                console.log("Error " + err);
            } else {
                console.log("Db: " + rows);
            }

            this.db.all(`SELECT * FROM emoji`, [], (err, rows) => {
                console.log(rows);
            })*/
        });

    }

    parseMessage(message) {
        // Takes in message object

        let m;
        let server = message.guild;

        while((m = this.regex.exec(message.content)) !== null) {
            // Avoiding infinite loops
            if (m.index === this.regex.lastIndex) {
                this.regex.lastIndex++;
            }
            // Only record emojis from the server of the message
            let emoji = server.emojis.get(m[2]);
            if (emoji !== undefined) {
                /*
                    0 - full emoji text
                    1 - emojiname
                    2 - emojiid
                */

                // If the emoji is in the server, then add it to the database
                console.log(`${(new Date()).toLocaleString()} | ${m[1]} in ${server.name} by ${message.author.username} in ${message.channel.name}`);   // Logging

                this.dbadd(m[1], m[2], message.author.username, message.author.id, server.name, server.id, 0, message.id);
            }
        }
    }

    dbadd(emojiname, emojiid, username, userid, servername, serverid, reaction=0, messageid) {    // Add serverid?
        // ${(new Date()).toLocaleString()} if db doesn't provide date
        // time = (new Date()).now() / 1000

        this.db.run(`INSERT INTO ${this._tablename} (emojiid, emojiname, userid, username, serverid, servername, reaction, time, messageid) VALUES (?, ?, ?, ?, ?, ?, ?, ${this.getTime(0)}, ?)`,
            [`${emojiid}`, `${emojiname}`, `${userid}`, `${username}`, `${serverid}`, `${servername}`, reaction, messageid], (err) => {
            if (err) {
                console.log(`Error inserting into database: ${err}`);
            } else {
                console.log(`${emojiname} by ${username} added to db.`);
            }
        });
    }

    dbremove(emojiname, userid, serverid, reaction=0, messageid) {    // Add serverid?
        // ${(new Date()).toLocaleString()} if db doesn't provide date
        // time = (new Date()).now() / 1000

        this.db.run(`DELETE FROM ${this._tablename} WHERE messageid = $mid AND userid = $uid AND emojiname = $ename AND reaction = 1 AND serverid = $sid`,
            {$ename: `${emojiname}`, $uid: `${userid}`, $sid: `${serverid}`, $mid: `${messageid}`}, (err) => {
            if (err) {
                console.log(`Error deleting from database: ${err}`);
            }
        });
    }

    serverLookup(message, time = -1){
        let server = message.guild;
        // "`Select * from this.tableName where serverid = ${server.id}, time > ${time}` count by emojiid"
        this.db.all(`SELECT emojiid, emojiname, COUNT(*) AS total FROM ${this._tablename} WHERE serverid = '${server.id}' AND time > ${this.getTime(time)} GROUP BY emojiname`, (err, data) => {
            //console.log(data);
            this.printEmojiCount(message, data);
        });
        // return results
    }

    userLookup(message, time, userid) {
        let server = message.guild;
        console.log("userLookup");
        // "`Select * from dbname where userid = ${userid}`"
        this.db.all(`SELECT emojiid, emojiname, COUNT(*) as total FROM ${this._tablename} WHERE userid = '${userid}' AND time > ${this.getTime(time)} GROUP BY emojiname`, [], (err, data) => {
            //console.log(data);
            this.printEmojiCount(message, data);
        });
    }

    emojiLookup(message, time, emojiname){
        // Get by emoji
        let server = message.guild;
        console.log("emojiLookup");
        this.db.all(`SELECT username, count(*) AS total FROM ${this._tablename} WHERE emojiname = '${emojiname}' AND time > ${this.getTime(time)} GROUP BY userid`, [], (err, data) => {
            //console.log(data);
            this.printEmojiCount(message, data);
        });
    }

    reactionLookup(message, time){
        // Get by emoji
        let server = message.guild;
        console.log("reactionLookup");
        this.db.all(`SELECT emojiid, emojiname, count(*) AS total FROM ${this._tablename} WHERE reaction = 1 AND time > ${this.getTime(time)} GROUP BY emojiname`, [], (err, data) => {
            //console.log(data);
            this.printEmojiCount(message, data);
        });
    }

    reactionUserLookup(message, time, userid) {
        let server = message.guild;
        console.log("userLookup");
        // "`Select * from dbname where userid = ${userid}`"
        this.db.all(`SELECT emojiid, emojiname, COUNT(*) as total FROM ${this._tablename} WHERE reaction = 1 AND userid = '${userid}' AND time > ${this.getTime(time)} GROUP BY emojiname`, [], (err, data) => {
            //console.log(data);
            this.printEmojiCount(message, data);
        });
    }

    constructEmojiCount(message, emojis) {
        // Returns string to send to display emoji list.
        let count = "";
        let counts = [];
        let validEmojis = this.getEmojiList(message.guild);

        if (emojis == undefined) return counts;

        let sortedEmojis = emojis.sort((a, b) => {
            return (a["total"] > b["total"] && -1) || (a["total"] < b["total"] && 1) || 0;
        })

        sortedEmojis.map((emoji) => {
            // get emojiid from server by lookup from emojiname
            //let counter = ("username" in emoji && emoji["username"]) || ("fullemoji" in emoji && validEmojis.includes(emoji["emojiid"]) && emoji["fullemoji"]) || ("emojiname" in emoji && emoji["emojiname"]);
            let key = ("username" in emoji && emoji["username"]) || ("emojiname" in emoji && emoji["emojiname"] in validEmojis && `${validEmojis[emoji["emojiname"]]}`) || null;
             //`<:${emoji["emojiname"]}:${emoji["emojiid"]}>: ${emoji["total"]}\n`;

            if (key !== null) {
                let line = `${key}: ${emoji["total"]}\n`;
                if (line.length + count.length > this._embedlength) {
                    counts.push(count);
                    count = "";
                    //console.log(counts);
                }
                count += line;
            }
        });
        if (count.length > 0) counts.push(count);

        return counts;
    }

    printEmojiCount(message, emojis) {
        // Consider if we want to lookup by userid

        if (message.guild.id === '349690785332985859' && message.channel.id !== '349983696134078464' && message.channel.id !== '349981310493917197' && message.channel.id !== '349691956021952515') {
            console.log("Channel not allowed to get emoji stats");
            return;
        }

        let results = this.constructEmojiCount(message, emojis);

        if (results.length == 0) {
            results = [""];
        }

        for (let i = 0; i < results.length; i++) {
            console.log(`${results[i].length}`);
            message.channel.send({embed: {
                "color": 15105570,
                "author": {
                    "name": "Emoji List"
                },
                /*"footer": {
                    "text": "React with a regional_indicator_x emote to remove"
                },*/
                "description": `${results[i]}`
            }})
            .then(sentMessage => {
                console.log('EmojiCount');
                sentMessage.delete(this.calcSeconds('1', 'min')*1000);
                //message.awaitReactions()
            });
        }

    }

    getEmojiList(server) {
        /* A list of emoji ids
        return server.emojis.map((emoji, id, collection) => {
            return id;
        });
        */

        // A dictionary mapping valid emojinames to id
        let emojis = {};
        server.emojis.map((emoji, id, collection) => {
            emojis[emoji.name] = emoji;
        });
        return emojis;
    }

    getTime(time = -1) {
        if (time == -1) {return 0;}
        return Math.floor(Date.now() / 1000) - this.parsedTime(time);
    }

    parsedTime(time) {
        if (time == 0) {return 0;}
        // second, minute, hour, day, month, y

        const regex = /^([0-9]+)(s|m|h|d|y|min)$/gm;
        let m

        while ((m = regex.exec(time)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            // 1 = num, 2 = time
            let seconds = this.calcSeconds(m[1], m[2]);
            console.log(`${time} | ${seconds}`);
            return seconds;
        }
    }

    calcSeconds (quantity, key) {
        switch(key) {
            case 's':
                return quantity;
            case 'min':
                return 60 * quantity;
            case 'h':
                return 3600 * quantity;
            case 'd':
                return 86400 * quantity;
            case 'w':
                return 86400 * 7 * quantity;
            case 'm':
                return 2635200 * quantity;
            case 'y':
                return 86400 * Math.floor(365.25 * quantity);
            default:
                return -1;
        }
    }
}