import {BaseCommand} from "../BaseCommand";
import * as Util from "../Util";

import * as fs from "fs";

export class HelpCommand extends BaseCommand {
    help: any;
    message: any;
    defaultPrefix: string;

    aliases = ["help", "h"];

    constructor(debug= false) {
        super(debug);
        this.importHelpFile();
    }

    handler(...args) {
        let [wiki, bot, message, page] = args;
        // this.bot = bot;
        this.message = message;
        this.defaultPrefix = process.env.DISCORD_PREFIX;
        if (page.length === 0) {
            page = ["help"];
        }

        if (page.length === 1) {
            const command = page[0].substring(0, 1).toUpperCase() + page[0].substring(1).toLowerCase();
            if (command in this.help) {
                this.run(command, message.author);
            }
        }
    }

    async run(command, channel) {
        const prefix = await Util.get_prefix(this.defaultPrefix, this.message);

        const embed = await this.createEmbed(command, prefix);
        channel.send(embed);
    }

    importHelpFile() {
        this.help = JSON.parse(fs.readFileSync(`${this.basePath}/cfg/help.json`, "utf-8"));
    }

    async createEmbed(command, prefix) {
        if (prefix === "\\") {
            prefix = "\\\\";
        }
        const fullCommand = prefix + command.toLowerCase();
        const targetReg = new RegExp("{command}", "g");
        let helpText = this.help[command];

        helpText = JSON.parse(JSON.stringify(helpText).replace(targetReg, fullCommand));

        helpText.color = 15105570;
        helpText.author = {name: `${command} Command Help Text`};
        return {embed: helpText};
    }
}
