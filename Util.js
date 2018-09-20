"use strict";

module.exports = class Util {
    constructor() {
    }

    get_user_id_mention(value, guild) {
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

    get_user_id_or_error(value, channel) {
        var guild = channel.guild;
        var userdata = new Util().get_user_id_mention(value, guild);
        if (userdata.success == true) return userdata.userid;
        else {
            if (userdata.reason == 0) {
                channel.send("The given user could not be found.  They may not be in the server now.").then(message => {
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

}
