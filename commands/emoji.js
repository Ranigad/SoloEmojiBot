"use strict";

const EmojiCounter = require('../EmojiParser.js');

const BaseCommand = require('../BaseCommand.js');

const Util = require('../Util.js');

module.exports = class EmojiCommand extends BaseCommand {

    constructor(debug=false) {
        super(debug);
    }

    run(...args) {
        let [wiki, bot, message, [first, second, third]] = args[0];
        const EC = new EmojiCounter();
        console.log(`${first} | ${second} | ${third}`);

        let mentions = message.mentions.members;
        console.log(mentions);

        const regex = /^([0-9]+)(s|m|w|h|d|y|min)$/gm;
        // User, server, emoji
        if ((first === "emoji" || first === "e")) {
            // emoji

            if (!second) return;

            if (second && second.match(regex) && third) {
                return EC.emojiLookup(message, second, this.getEmojiAttr(message, third, "name"));
            }

            if (third && third.match(regex)) {
                return EC.emojiLookup(message, third, this.getEmojiAttr(message, second, "name"));
            }

            return EC.emojiLookup(message, -1, this.getEmojiAttr(message, second, "name"));
        } else if (first === "user" || first === "u") {
            // user

            let useriddata = Util.get_user_id_mention(third, message.channel.guild, true);
            let useriddata2 = Util.get_user_id_mention(second, message.channel.guild, true);

            let userid = undefined;
            let timevalue = -1;

            if (second) {
                if (useriddata2.success) userid = useriddata2.userid;
                else if (!second.match(regex)) {
                    return;
                }
                else timevalue = second;
            }

            if (third) {
                if (useriddata.success && userid == undefined) userid = useriddata.userid;
                else if (useriddata.success) return;
                else if (third.match(regex) && timevalue == -1) timevalue = third;
                else return;
            }

            if (userid == undefined) userid = message.author.id;

            EC.userLookup(message, timevalue, userid);
        } else if ((first === "server" || first === "s")) {
            // server
            // validate second
            if (second && !second.match(regex)) {
                return;
            }

            EC.serverLookup(message, second);

        } else if ((first === "reaction" || first === "r")) {
            // server
            // validate second
            let useriddata = Util.get_user_id_mention(third, message.channel.guild);
            let useriddata2 = Util.get_user_id_mention(second, message.channel.guild);

            let userid = undefined;
            let timevalue = -1;

            if (second) {
                if (useriddata2.success) userid = useriddata2.userid;
                else if (!second.match(regex)) {
                    return;
                }
                else timevalue = second;
            }

            if (third) {
                if (useriddata.success && userid == undefined) userid = useriddata.userid;
                else if (useriddata.success) return;
                else if (third.match(regex) && timevalue == -1) timevalue = third;
                else return;
            }

            if (userid != undefined) {
                EC.reactionUserLookup(message, timevalue, userid);
            }
            else {
                EC.reactionLookup(message, timevalue);
            }
        } else if (second === undefined) {
            // ;emoji [arg]
            second = -1;
            let useriddata = Util.get_user_id_mention(first, message.channel.guild);
            if (first && first.match(regex)) {
                EC.serverLookup(message, first);
            } else if (first === undefined) {
                EC.serverLookup(message);
            } else if (mentions.size > 0) {
                EC.userLookup(message, second, mentions.first().id);
            } else if (useriddata.success) {
                EC.userLookup(message, second, useriddata.userid);
            } else if (first) {
                EC.emojiLookup(message, second, this.getEmojiAttr(message, first, "name")); //message.guild.emojis.find('name', first).id)
            }
        } else if (third === undefined) {
            // Scenarios: {<user> -> <time>, <emoji> -> <time>, <time> -> <user>, <time> -> <emoji>}
            let useriddata = Util.get_user_id_mention(first, message.channel.guild);
            let useriddata2 = Util.get_user_id_mention(second, message.channel.guild);
            
            if (second.match(regex)) {
                console.log("second matches");
                if (useriddata.success) {
                    EC.userLookup(message, second, useriddata.userid);
                }
                else {
                    EC.emojiLookup(message, second, this.getEmojiAttr(message, first, "name"));
                }
            }
            else if (first.match(regex)) {
                console.log("first matches");
                if (useriddata2.success) {
                    EC.userLookup(message, first, useriddata2.userid);
                }
                else {
                    EC.emojiLookup(message, first, this.getEmojiAttr(message, second, "name"));
                }
            }
        } else {
            EC.serverLookup(message);
        }
    }

    getEmojiAttr(message, emojiname, attr) {
        let emoji = message.guild && message.guild.emojis.find(attr, emojiname);
        return (emoji && emoji[attr]) || -1;
    }
}
