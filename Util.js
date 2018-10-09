"use strict";
const tesseract = require('tesseract.js');
const https = require('https');
const fs = require('fs');
const typeorm = require('typeorm');
const entityManager = typeorm.getManager();
const Guild = require("./model/Guild").Guild;


const get_user_id_mention = (value, guild, named = false) => {
    if (value == undefined) return {success: false, reason: 2};
    //console.log(value);
    var userid = undefined;
    var regex1 = /<@\d+>/;
    var regex2 = /\d+/;

    let attempt1 = regex1.exec(value);
    let attempt2 = regex2.exec(value);

    if (attempt1 != null && attempt1.length == 1 && attempt1[0] == value) {
        userid = value.replace("<", "");
        userid = userid.replace("@", "");
        userid = userid.replace(">", "");
    }
    else {
        var words = value.split("#");
        if (words.length == 2) {
            let [name, discriminator] = [words[0]];
            var guild_member = guild.members.find(member => member.user.username == name && member.user.discriminator);
            if (guild_member == undefined) {
                return {success: false, reason: 0};
            }
            userid = guild_member.user.id;
        }
        else if (attempt2 != null && attempt2.length == 1 && attempt2[0] == value) {
            userid = value;
        }
        else if (named) {
            var guild_member = guild.members.find(member => member.user.username == value);
            if (guild_member == undefined) {
                return {success: false, reason: 3};
            }
            userid = guild_member.user.id;
        }
        else {
            // Error - not ping, name&discriminator, or ID
            return {success: false, reason: 1};
        }
    }
    return {success: true, userid: userid};
}

const get_user_id_or_error = (value, channel, named = false) => {
    var guild = channel.guild;
    var userdata = get_user_id_mention(value, guild, named);
    if (userdata.success == true) return userdata.userid;
    else {
        if (userdata.reason == 0) {
            channel.send("The given user could not be found.  They may not be in the server now").then(message => {
                message.delete(10000);
            });
            return undefined;
        }
        else if (userdata.reason == 1) {
            channel.send("Error: Please only mention user with their name#discriminator, ID, or ping").then(message => {
                message.delete(10000);
            });
            return undefined;
        }
    }
}

const log_message = (message, client) => {
    if (message == undefined || client == undefined) return;
    let message_content = message.content;
    for (var mention of message.mentions.users.array()) {
        let regex = new RegExp(`<@${mention.id}>`,'g');
        message_content = message_content.replace(regex, `<@<${mention.username}#${mention.discriminator}>>`);
    }
    const server_id = process.env.TEST_SERVER;
    const log_id = process.env.LOG_CHANNEL;
    const date = new Date();
    const date_string = date.toUTCString();
    const full_msg = `${date_string}: #${message.channel.name} - ${message.author.tag}: ${message_content}`;
    const msg = full_msg.substr(0, 1999);
    client.guilds.get(server_id).channels.get(log_id).send(msg);
}

const log_general = (message, client) => {
    if (message == undefined || client == undefined) return;
    const server_id = process.env.TEST_SERVER;
    const log_id = process.env.LOG_CHANNEL;
    const date = new Date();
    const date_string = date.toUTCString();
    const full_msg = `${date_string}: **BOT_MESSAGE**: ${message}`;
    const msg = full_msg.substr(0, 1999);
    client.guilds.get(server_id).channels.get(log_id).send(msg);
}

const process_image = async (message) => {
    let attachments = message.attachments;
    if (attachments == undefined || attachments.array() == undefined || attachments.array().length != 1) return;
    attachments = attachments.array();
    console.log(attachments);
    let attachment = attachments[0];
    if (attachment.url == undefined || attachment.width == undefined) return;
    let url = attachment.url;
    let file_name = message.author.username + new Date().toUTCString();
    let file = fs.createWriteStream(`temp/${file_name}`);
    let request = https.get(url, async function(response) {
        response.pipe(file).on('finish', async function() {
            try {
                let result = await tesseract.recognize(`temp/${file_name}`, {lang: 'jpn'});
                let text = result.text;
                //console.log(result);
                let msg = ["この夕工ス卜には以下の開始条件がぁります", "環", "いろは", "のみのチ-ムでク工ス卜を開始"];
                if (text.includes(msg[0]) && text.includes(msg[1]) && text.includes(msg[2]) && text.includes(msg[3])) {
                    // Iroha only message
                    message.reply("that battle requires you to only use Iroha *(Mokyuu Auto Reply)*");
                }
            }
            catch (error) {
                console.log(error);
            }
            fs.unlink(`temp/${file_name}`);
        });
    });
}

const get_prefix = async (prefix, message) => {
    if (message.guild != undefined && message.guild.id != undefined) {
        let guild = await entityManager.createQueryBuilder(Guild, "guild")
            .where("guild.guild_id = :id", {id: message.guild.id})
            .getOne();
        if (guild != undefined) {
            prefix = guild.prefix;
        }
    }
    return prefix;
}

module.exports = {
    get_user_id_mention,
    get_user_id_or_error,
    log_message,
    log_general,
    process_image,
    get_prefix
}

