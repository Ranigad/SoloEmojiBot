"use strict";

const EmojiCounter = require('../EmojiParser.js');

const BaseCommand = require('../BaseCommand.js');

module.exports = class TestCommand extends BaseCommand {

    constructor(debug=false) {
        super(debug);
    }

    run(...args) {
        let [wiki, bot, message, [source, time, target]] = args[0];
        const EC = new EmojiCounter();
        console.log(`${source} | ${time} | ${target}`);

        let mentions = message.mentions.members;
        console.log(mentions);

        const regex = /^([0-9]+)(s|m|h|d|y|min)$/gm;
        // User, server, emoji
        if ((source === "emoji" || source === "e")) {
            // emoji
            [time, target] = [target, time]
            if (time && !time.match(regex)){
                return;
            }

            if (target) {
                EC.emojiLookup(message, time, this.getEmojiAttr(message, target, "name")); //message.guild.emojis.find('name', target).id);   // emojiname
            }
        } else if (source === "user" || source === "u") {
            // user

            let userid = (mentions.size > 0 && mentions.first().id) || message.author.id;

            this.print(userid);

            if (time && !time.match(regex)) {
                if (mentions.length <= 0) {
                    return;
                } else {
                    time = -1;
                }
            }

            if (userid) {
                EC.userLookup(message, time, userid);   // username
            }
        } else if ((source === "server" || source === "s")) {
            // server
            // validate time
            if (time && !time.match(regex)) {
                return
            }

            EC.serverLookup(message, time);

        } else if ((source === "reaction" || source === "r")) {
            // server
            // validate time
            if (time && !time.match(regex)) {
             return
            }

            EC.reactionLookup(message, time);

        } else if (time === undefined) {
            // ;emoji [arg]
            time = -1;
            if (source && source.match(regex)) {
                EC.serverLookup(message, source);
            } else if (source === undefined) {
                EC.serverLookup(message);
            } else if (mentions.size > 0) {
                EC.userLookup(message, time, mentions.first().id);
            } else if (source) {
                EC.emojiLookup(message, time, this.getEmojiAttr(message, source, "name")); //message.guild.emojis.find('name', source).id)
            }
        } else if (target === undefined) {
            if (time.match(regex)) {
                if (mentions.size > 0) {
                    EC.userLookup(message, time, mentions.first().id);
                } else {
                    EC.emojiLookup(message, time, this.getEmojiAttr(message, source, "name"));//message.guild.emojis.find('name', source).id);
                }
            }
        } else {
            EC.printEmojiCount(message, []);
        }
    }

    getEmojiAttr(message, emojiname, attr) {
        let emoji = message.guild && message.guild.emojis.find(attr, emojiname);
        return (emoji && emoji[attr]) || -1;
    }
}