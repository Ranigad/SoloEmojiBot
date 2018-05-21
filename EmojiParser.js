"use strict";


//

class EmojiParser {

    constructor() {
        this.regex = /\<\:([\w]{2,})\:([\d]+)\>/g;
        this.dbname = "";
        this.tableName = "emoji";  // time, emoji name, emoji id, user, actual emoji
    }

    dbadd(emojiname, emojiid, userid, serverid, emoji, reaction=false) {    // Add serverid?
        // ${(new Date()).toLocaleString()} if db doesn't provide date
    }

    emojiLookup(server, time){
        // "`Select * from this.tableName where serverid = ${server.id}, time > ${time}` count by emojiid"
        // return results
    }

    userLookup(userid) {
        // "`Select * from dbname where userid = ${userid}`"
    }

    userLookupByEmoji(userid){
        // Get by emoji
    }

    parseMessage(message, server) {
        // Takes in message and server object

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
                this.dbadd(m[1], m[2], message.author.id, server.id, emoji);
            }
        }
    }

    printEmojiCount(server, time=null) {
        // Consider if we want to lookup by userid

        let emojis = emojiLookup(server, time || "Start time");

        /*
        sortedEmojis.map((emoji, emojiID, z) => { //for (let key in sortedEmojis) {
                    //count += ${this.emojiMap.get(key)}
                    let line = `${emoji}**:** ${emojis[emojiID]} \n`;
                    if (line.length + count.length > 2000) {
                        counts.push(count);
                        count = "";
                        //console.log(counts);
                    }
                    count += line;
                });
                if (count.length > 0) counts.push(count);

                return counts;
        */
    }

}