"use strict";

const get_user_id_mention = (value, guild) => {
    console.log(value);
    var userid = undefined;
    var regex1 = /<@\d+>/;
    var regex2 = /\d+/;
    if (regex1.test(value)) {
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
        else if (regex2.test(value)) {
            userid = value;
        }
        else {
            // Error - not ping, name&discriminator, or ID
            return {success: false, reason: 1};
        }
    }
    return {success: true, userid: userid};
}

const get_user_id_or_error = (value, channel) => {
    var guild = channel.guild;
    var userdata = get_user_id_mention(value, guild);
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
    const server_id = process.env.SERVER_ID;
    const log_id = process.env.LOG_CHANNEL;
    const date = new Date();
    const date_string = date.toUTCString();
    const full_msg = `${date_string}: #${message.channel.name} - ${message.author.tag}: ${message.content}`;
    const msg = full_msg.substr(0, 1999);
    client.guilds.get(server_id).channels.get(log_id).send(msg);
}


module.exports = {
    get_user_id_mention,
    get_user_id_or_error,
    log_message
}

