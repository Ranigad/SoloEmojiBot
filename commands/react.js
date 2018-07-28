const BaseCommand = require('../BaseCommand.js');

module.exports = class React extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;
        if (cmdargs.length == 0) {
            if (message.deletable) message.delete(10000)
            return message.channel.send('You need to provide a message ID and an emote ID, $emote <message-ID> <emote-ID or $shortcut$>')
                .then(message => {
                    message.delete(10000)
                });
        }

        var message_id = cmdargs[0];
        var emoji = cmdargs[1];

        this.run(message_id, emoji, message);
    }

    run(message_id, emoji, message) {
        var re = new RegExp("$([A-Za-z0-9_])+$");
        if (re.test(emoji) == true) {
            var emoji_name = emoji.replace('$', '');
            // TODO: Check database for emoji ID from shortcode (e.g. $yachiyonice$)
        }

        var mainmsg = message;

        var channels = [];
        if (message.channel.type == 'text') {
            var guild = message.channel.guild;
            guild.channels.forEach(channel => {
               if (channel.type == 'text') {
                    channels.push(channel);
                }
            })
        }
        else channels.push(message.channel);

        react_to_message(channels);

        function react_to_message(channels) {
            var channel = channels.shift();
            if (channel == undefined) {
                mainmsg.channel.send('Could not find the given message.')
                .then(message => {
                    message.delete(10000)
                });
                if (mainmsg.deletable) mainmsg.delete(10000);
            }
            channel.fetchMessage(message_id)
            .then(message => {
                message.react(emoji)
                    .then((reaction) => {
                        if (mainmsg.deletable) mainmsg.delete();

                        setTimeout(function() {
                            reaction.remove();
                        }, 20000)
                    })
                    .catch(() => {
                        mainmsg.channel.send(`Could not apply the given emote.`)
                        .then(message => {
                            message.delete(10000)
                        });
                        if (mainmsg.deletable) mainmsg.delete(10000)
                    });
            })
            .catch(() =>{
                react_to_message(channels);
            });
        }
    }

}


