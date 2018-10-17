const BaseCommand = require('../BaseCommand.js');
const Util = require('../Util.js');

module.exports = class React extends BaseCommand {
    constructor(debug=false, config=undefined) {
        super(debug);
        this.config = config;
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;
        let commandPrefix = Util.get_prefix(process.env.DISCORD_PREFIX, message);
        this.emojis = bot.emojis;

        if (cmdargs.length != 2 && this.config == undefined) {
            return this.send_error_message(`You need to provide a message ID and an emote name, ${commandPrefix}react <message-ID> <emote-name>`);
        }
        if (this.config != undefined) {
            if (this.config.option == "channel" && message.channel.type != "text") {
                return this.send_error_message(`You cannot run ${commandPrefix}reactchannel in this chat`);
            }
            if (this.config.option == "channel" && cmdargs.length != 2) {
                return this.send_error_message(`You need to provide a channel name or channel Id and an emote name, ${commandPrefix}react <channel> <emote-name>`);
            }
            if (this.config.option == "channel" && cmdargs[0] == message.channel.id) {
                return this.react_now(cmdargs[1], message.channel, message);
            }
            if (this.config.option == "now" && cmdargs.length != 1) {
                return this.send_error_message(`You need to provide an emote name, ${commandPrefix}reactnow <emote-name>`);
            }
            if (this.config.option == "now") {
                return this.react_now(cmdargs[0], message.channel, message);
            }
        }

        let message_id = cmdargs[0];
        let emoji = cmdargs[1];

        this.run(message_id, emoji, message);
    }

    async react_now(emoji_name, channel, message) {
        let messages = await channel.fetchMessages({ limit: 1, before: message.id });
        if (messages == undefined || messages.array == undefined || messages.array.length == undefined) {
            return this.send_error_message("Could not find a message to react to");
        }
        let target = messages.array()[0];
        let emoji = this.emojis.find('name', emoji_name);
        this.react_to_message(target, emoji, message);
    }

    send_error_message(user_msg, error) {
        if (user_msg.deletable) user_msg.delete(10000)
        return user_msg.channel.send(error)
            .then(message => {
                message.delete(10000)
            });
    }

    async react_to_message(message, emoji, mainmsg) {
        try {
            let reaction = await message.react(emoji);
            if (mainmsg.deletable) mainmsg.delete();

            setTimeout(function() {
                reaction.remove();
            }, 20000);
            return true;
        }
        catch(ex) {
            mainmsg.channel.send(`Could not apply the given emote.`)
            .then(message => {
                message.delete(10000)
            });
            if (mainmsg.deletable) mainmsg.delete(10000)
            return false;
        }
    }

    async run(message_id, emoji_name, message) {
        let emoji = this.emojis.find('name', emoji_name);

        let mainmsg = message;

        let initialId = message.channel.id;
        let channels = [];
        channels.push(message.channel);
        if (message.channel.type == 'text') {
            let guild = message.guild;
            guild.channels.forEach(channel => {
               if (channel.type == 'text' && channel.id != initialId) {
                    channels.push(channel);
                }
            })
        }

        let success = false;
        while (channels.length > 0) {
            let channel = channels.shift();
            if (channel == undefined || channel.lastMessageID == undefined) continue;
            try {
                let message = await channel.fetchMessage(message_id);

                let applied = await this.react_to_message(message, emoji, mainmsg);

                if (applied == false) return;
                else success = true;
            }
            catch(ex) {
                continue;
            }
        }

        if (success == false) {
            mainmsg.channel.send('Could not find the given message.')
            .then(message => {
                message.delete(10000)
            });
            if (mainmsg.deletable) mainmsg.delete(10000);
        }

    }

}


