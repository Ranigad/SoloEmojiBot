import {BaseCommand} from "../BaseCommand";

import * as Util from "../Util";

export class ReactCommand extends BaseCommand {
    config: any;
    emojis: any;

    constructor(debug = false, config) {
        super(debug);
        this.config = config;
    }

    handler(...args) {
        const [wiki, bot, message, cmdargs] = args;
        const commandPrefix = Util.get_prefix(process.env.DISCORD_PREFIX, message);
        this.emojis = bot.emojis;

        if (cmdargs.length !== 2 && this.config === undefined) {
            return this.send_error_message(
                message,
                `You need to provide a message ID and an emote name, ${commandPrefix}react <message-ID> <emote-name>`
            );
        }
        if (this.config !== undefined) {
            if (this.config.option === "channel" && message.channel.type !== "text") {
                return this.send_error_message(message, `You cannot run ${commandPrefix}reactchannel in this chat`);
            }
            if (this.config.option === "channel" && cmdargs.length !== 2) {
                return this.send_error_message(
                    message,
                    `You need to provide a channel name or channel Id and an emote name, ${commandPrefix}react <channel> <emote-name>`
                );
            }
            if (this.config.option === "channel" && cmdargs[0] === message.channel.id) {
                return this.react_now(cmdargs[1], message.channel, message);
            }
            if (this.config.option === "channel") {
                const id_or_name = cmdargs[0];
                const guild = message.guild;
                const channels = guild.channels;
                if (channels === undefined || channels.array() === undefined || channels.array().length < 1) {
                    return this.send_error_message(message, "Could not find the given channel");
                }
                let channel = channels.find("id", id_or_name);
                if (channel !== undefined) { return this.react_channel(cmdargs[1], channel, message); }
                channel = channels.find("name", id_or_name);
                if (channel === undefined) {
                    return this.send_error_message(message, "Could not find the given channel");
                }
                if (channel.name === id_or_name) { return this.react_now(cmdargs[1], channel, message); }
                return this.react_channel(cmdargs[1], channel, message);
            }
            if (this.config.option === "now" && cmdargs.length !== 1) {
                return this.send_error_message(message, `You need to provide an emote name, ${commandPrefix}reactnow <emote-name>`);
            }
            if (this.config.option === "now") {
                return this.react_now(cmdargs[0], message.channel, message);
            }
        }

        const message_id = cmdargs[0];
        const emoji = cmdargs[1];

        const promise = this.run(message_id, emoji, message);
    }

    async react_channel(emoji_name, channel, message) {
        const recent_message = channel.lastMessageID;
        if (recent_message === undefined) {
            return this.send_error_message(message, "Could not find a message in that channel");
        }
        const target = await channel.fetchMessage(recent_message);
        if (target === undefined) {
            return this.send_error_message(message, "Could not find a message in that channel");
        }
        const emoji = this.emojis.find("name", emoji_name);
        await this.react_to_message(target, emoji, message);
    }

    async react_now(emoji_name, channel, message) {
        const messages = await channel.fetchMessages({ limit: 1, before: message.id });
        if (messages === undefined || messages.array() === undefined || messages.array().length < 1) {
            return this.send_error_message(message, "Could not find a message to react to");
        }
        const target = messages.array()[0];
        const emoji = this.emojis.find("name", emoji_name);
        await this.react_to_message(target, emoji, message);
    }

    send_error_message(user_msg, error) {
        if (user_msg.deletable) { user_msg.delete(10000); }
        user_msg.channel.send(error)
            .then((message) => {
                message.delete(10000);
            });
    }

    async react_to_message(message, emoji, mainmsg) {
        try {
            const reaction = await message.react(emoji);
            if (mainmsg.deletable) { mainmsg.delete(); }

            setTimeout(() => {
                reaction.remove();
            }, 20000);
            return true;
        } catch (ex) {
            mainmsg.channel.send(`Could not apply the given emote.`)
            .then((delMsg) => {
                delMsg.delete(10000);
            });
            if (mainmsg.deletable) { mainmsg.delete(10000); }
            return false;
        }
    }

    async run(message_id, emoji_name, message) {
        const emoji = this.emojis.find("name", emoji_name);

        const mainmsg = message;

        const initialId = message.channel.id;
        const channels = [];
        channels.push(message.channel);
        if (message.channel.type === "text") {
            const guild = message.guild;
            guild.channels.forEach((channel) => {
               if (channel.type === "text" && channel.id !== initialId) {
                    channels.push(channel);
                }
            });
        }

        let success = false;
        while (channels.length > 0) {
            const channel = channels.shift();
            if (channel === undefined || channel.lastMessageID === undefined) { continue; }
            try {
                const fetchedMsg = await channel.fetchMessage(message_id);

                const applied = await this.react_to_message(fetchedMsg, emoji, mainmsg);

                if (applied === false) { return; } else { success = true; }
            } catch (ex) {
                continue;
            }
        }

        if (success === false) {
            mainmsg.channel.send("Could not find the given message.")
            .then((delMsg) => {
                delMsg.delete(10000);
            });
            if (mainmsg.deletable) { mainmsg.delete(10000); }
        }

    }

}
