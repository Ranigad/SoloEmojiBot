"use strict";
const fs = require('fs');
const path = require('path');
const Util = require('./Util.js');
let wiki = new (require('./wiki.js').Wikia)();
// Bot check before passing in

module.exports = class CommandHandler {
    constructor(prefix, debug=false, bot=false, commandDirectory="./commands") {
        this.commandDirectory = commandDirectory;
        this.defaultPrefix = prefix;
        this.debug = debug;
        this.bot = bot;
        console.log(path.dirname(require.main.filename));
    }

    print(message) {
        if (this.debug) console.log(message);
    }

    parser(message, prefix) {
        // 2. Extract message if proper prefix
        if(!(message.startsWith(prefix))) return false;
        const args = message.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
        return {"command": command, "arguments": args}
    }

    isCommand(command) {
        return fs.existsSync(`${this.commandDirectory}/${command}.js`);
    }

    // Takes in the message object received by the bot and takes appropriate action
    async handle(message) {
        //-----------------------------------------------------------------------------------
        // 1. Parse message
        let prefix = await Util.get_prefix(this.defaultPrefix, message);

        let parsedMessage = this.parser(message.content, prefix);
        if (!parsedMessage) return true; // Return if the prefix is not correct

        // Log the command
        Util.log_message(message, this.bot);

        let [command, args] = [parsedMessage["command"], parsedMessage["arguments"]];

        this.debug_print("parser", command, args);

        //-----------------------------------------------------------------------------------
        // 2. Get the command
        if(!this.isCommand(command)) {
            this.debug_print("commandcheck");
            return true;
        }

        let runnableCommand = new (require(`${this.commandDirectory}/${command}.js`))(this.debug);

        this.debug_print("command", runnableCommand);

        //-----------------------------------------------------------------------------------
        // 3. Run Command
        //if (args[0] === "help") {
            // this.debug_print("help", `${runnableCommand.help}`);
        //} else {
            // Wikia object, Bot object, message object,
            //runnableCommand.handler(wiki, this.bot, {'guild': {'id': '197546763916279809'}, 'message': 'dinosaurs'}, args);
        runnableCommand.handler(wiki, this.bot, message, args);
        //}
    }

    debug_print(section, ...message) {
        if (section === "parser") {
            this.print(`1. ${section.toUpperCase()} | ${message[0]} | ${message[1]}`);
        } else if (section === "commandcheck") {
            this.print("1.5 Command does not exist.");
        } else if (section === "command") {
            this.print(`2. ${section.toUpperCase()} | ${message}`);
        } else if (section === "help") {
            this.print(`0. ${section.toUpperCase()} | ${runnableCommand.help}`);
        }
    }
}