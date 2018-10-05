"use strict";

const EmojiCounter = require('../EmojiParser.js');

const BaseCommand = require('../BaseCommand.js');

const Util = require('../Util.js');

module.exports = class EmojiCommand extends BaseCommand {

    constructor(debug=false) {
        super(debug);
    }

    run(...args) {
        let [wiki, bot, message, [source, time, target]] = args[0];
        const EC = new EmojiCounter();
        console.log(`${source} | ${time} | ${target}`);

        let mentions = message.mentions.members;
        console.log(mentions);

        const regex = /^([0-9]+)(s|m|w|h|d|y|min)$/gm;
        // User, server, emoji
        if ((source === "emoji" || source === "e")) {
            // emoji

            if (!time) return;

            if (time && time.match(regex) && target) {
                return EC.emojiLookup(message, time, this.getEmojiAttr(message, target, "name"));
            }

            if (target && target.match(regex)) {
                return EC.emojiLookup(message, target, this.getEmojiAttr(message, time, "name"));
            }

            return EC.emojiLookup(message, -1, this.getEmojiAttr(message, time, "name"));
        } else if (source === "user" || source === "u") {
            // user

            let useriddata = Util.get_user_id_mention(target, message.channel.guild);
            let useriddata2 = Util.get_user_id_mention(time, message.channel.guild);

            let userid = undefined;
            let timevalue = -1;

            if (time) {
                if (useriddata2.success) userid = useriddata2.userid;
                else if (!time.match(regex)) {
                    return;
                }
                else timevalue = time;
            }

            if (target) {
                if (useriddata.success && userid == undefined) userid = useriddata.userid;
                else if (useriddata.success) return;
                else if (target.match(regex) && timevalue == -1) timevalue = target;
                else return;
            }

            if (userid == undefined) userid = message.author.id;

            EC.userLookup(message, timevalue, userid);
        } else if ((source === "server" || source === "s")) {
            // server
            // validate time
            if (time && !time.match(regex)) {
                return;
            }

            EC.serverLookup(message, time);

        } else if ((source === "reaction" || source === "r")) {
            // server
            // validate time
            let useriddata = Util.get_user_id_mention(target, message.channel.guild);
            let useriddata2 = Util.get_user_id_mention(time, message.channel.guild);

            let userid = undefined;
            let timevalue = -1;

            if (time) {
                if (useriddata2.success) userid = useriddata2.userid;
                else if (!time.match(regex)) {
                    return;
                }
                else timevalue = time;
            }

            if (target) {
                if (useriddata.success && userid == undefined) userid = useriddata.userid;
                else if (useriddata.success) return;
                else if (target.match(regex) && timevalue == -1) timevalue = target;
                else return;
            }

            if (userid != undefined) {
                EC.reactionUserLookup(message, timevalue, userid);
            }
            else {
                EC.reactionLookup(message, timevalue);
            }
        } else if (time === undefined) {
            // ;emoji [arg]
            time = -1;
            let useriddata = Util.get_user_id_mention(source, message.channel.guild);
            if (source && source.match(regex)) {
                EC.serverLookup(message, source);
            } else if (source === undefined) {
                EC.serverLookup(message);
            } else if (mentions.size > 0) {
                EC.userLookup(message, time, mentions.first().id);
            } else if (useriddata.success) {
                EC.userLookup(message, time, useriddata.userid);
            } else if (source) {
                EC.emojiLookup(message, time, this.getEmojiAttr(message, source, "name")); //message.guild.emojis.find('name', source).id)
            }
        } else if (target === undefined) {
            // Scenarios: {<user> -> <time>, <emoji> -> <time>, <time> -> <user>, <time> -> <emoji>}
            let useriddata = Util.get_user_id_mention(source, message.channel.guild);
            let useriddata2 = Util.get_user_id_mention(time, message.channel.guild);
            
            if (time.match(regex)) {
                console.log("time matches");
                if (useriddata.success) {
                    EC.userLookup(message, time, useriddata.userid);
                }
                else {
                    EC.emojiLookup(message, time, this.getEmojiAttr(message, source, "name"));
                }
            }
            else if (source.match(regex)) {
                console.log("source matches");
                if (useriddata2.success) {
                    EC.userLookup(message, source, useriddata2.userid);
                }
                else {
                    EC.emojiLookup(message, source, this.getEmojiAttr(message, time, "name"));
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
