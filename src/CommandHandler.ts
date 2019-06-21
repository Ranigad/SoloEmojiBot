
import * as fs from "fs";
import * as path from "path";
import * as Util from "./Util";
import { Wikia } from "./wiki";

const wiki = new Wikia();

import { Logger } from "./Logger";

import { BaseCommand } from "./BaseCommand";
import * as Commands from "./commands";

// Bot check before passing in

export class CommandHandler {

    private aliases: { [key: string]: BaseCommand } = {};

    constructor(private defaultPrefix: string, private bot, private debug = false, private commandDirectory= "commands") {
        Logger.log(path.dirname(require.main.filename));
        this.initAliases();
    }

    print(message) {
        if (this.debug) { Logger.log(message); }
    }

    parser(message, prefix) {
        // 2. Extract message if proper prefix
        if (!(message.startsWith(prefix))) { return false; }
        const args = message.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
        return {command, arguments: args};
    }

    isCommand(command: string) {
        if (command === undefined) {
            return false;
        }
        return fs.existsSync(`./src/${this.commandDirectory}/${command}.ts`);
    }

    // Takes in the message object received by the bot and takes appropriate action
    async handle(message) {
        // -----------------------------------------------------------------------------------
        // 1. Parse message
        const prefix = await Util.get_prefix(this.defaultPrefix, message);

        const parsedMessage = this.parser(message.content, prefix);
        if (!parsedMessage) { return true; } // Return if the prefix is not correct

        // Log the command
        const promise = Util.log_message(message, this.bot);

        const [command, args] = [parsedMessage.command, parsedMessage.arguments];

        this.debug_print("parser", command, args);

        // -----------------------------------------------------------------------------------
        // 2. Get the command
        if (!this.isCommand(command)) {
            this.debug_print("commandcheck");
            return true;
        } else {
            Logger.log("Command exists");
        }

        const commandInstance = this.getCommandClassInstance(command, false);

        if (commandInstance !== undefined) {
            Logger.log("Command initialized");
            commandInstance.handler(wiki, this.bot, message, args);
        }

        // Logger.log(this.commandDirectory);
        //
        // let commandDirectory = this.commandDirectory;
        //
        // let importedClass = await import(`./src/${commandDirectory}/${command}.ts`);
        // let commandInstance = new importedClass(this.bot, message);

    }

    getCommandClassInstance(command: string, debug: boolean) {
        const commandClass = this.getCommandClass(command);
        if (commandClass === undefined) { return undefined; }
        return new commandClass(debug);
    }

    getCommandClass(command: string) {
        switch (command) {
            default:
                return undefined;
        }
    }

    debug_print(section, ...message) {
        if (section === "parser") {
            this.print(`1. ${section.toUpperCase()} | ${message[0]} | ${message[1]}`);
        } else if (section === "commandcheck") {
            this.print("1.5 Command does not exist.");
        } else if (section === "command") {
            this.print(`2. ${section.toUpperCase()} | ${message}`);
        } else if (section === "help") {
            this.print(`0. ${section.toUpperCase()}`);
        }
    }

    private initAliases() {
        Object.keys(Commands).forEach((cmdName) => {
            const cmdProto = new Commands[cmdName]();

            cmdProto.aliases.forEach((alias) => {
                if (this.aliases[alias]) { throw new Error(`Command at alias "${alias}" already exists.`); }
                this.aliases[alias] = cmdProto;
            });
        });
    }
}
