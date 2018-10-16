const BaseCommand = require('../BaseCommand.js');

module.exports = class React extends BaseCommand {
    constructor(debug=false, config=undefined) {
        super(debug);
        this.config = config;
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;
        if (cmdargs.length != 2) {
            if (message.deletable) message.delete(10000)
            return message.channel.send('You need to provide a message ID and an emote name, ;react <message-ID> <emote-name>')
                .then(message => {
                    message.delete(10000)
                });
        }

        let message_id = cmdargs[0];
        let emoji = cmdargs[1];

        this.run(message_id, emoji, message, bot.emojis);
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

    async run(message_id, emoji_name, message, emojis) {
        let emoji = emojis.find('name', emoji_name);

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


