const BaseCommand = require('../BaseCommand.js');
const fs = require('fs');
const Util = require('../Util.js');

module.exports = class Help extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        this.importHelpFile();
    }

    handler(...args) {
        let [wiki, bot, message, page] = args;
        this.bot = bot;
        this.message = message;

        if (page.length == 0) {
            page = ["help"];
        }

        if (page.length == 1) {
            let command = page[0].substring(0, 1).toUpperCase() + page[0].substring(1).toLowerCase();
            if (command in this.help) {
                this.run(command, message.author);
            }
        }
    }

    async run(command, channel) {
        let main_prefix = process.env.DISCORD_PREFIX;
        let prefix = await Util.get_prefix(this.bot, this.message);

        let embed = await this.createEmbed(command, prefix);
        channel.send(embed);
        if (main_prefix != prefix && this.message.content.startsWith(`${process.env.DISCORD_PREFIX}help`)) {
            let message = "Pleases note, on this server, \"" + this.message.guild.name + "\", the prefix \"``" + prefix + "``\" is supported instead of \"``" + main_prefix + "``\"";
            channel.send(message);
        }
    }

    importHelpFile() {
        this.help = JSON.parse(fs.readFileSync(`${this._basePath}/cfg/help.json`));
    }

    async createEmbed(command, prefix) {
        let orig_regex = new RegExp(process.env.DISCORD_PREFIX, 'g');
        let helpText = this.help[command];

        for (var i in helpText) {
            if (Array.isArray(helpText[i])) {
                for (var j in helpText[i]) {
                    if (typeof helpText[i][j] == "object") {
                        for (var k in helpText[i][j]) {
                            if (typeof helpText[i][j][k] == "string") {
                                helpText[i][j][k] = helpText[i][j][k].replace(orig_regex, prefix);
                            }
                        }
                    }
                    if (typeof helpText[i][j] == "string") {
                        helpText[i][j] = helpText[i][j].replace(orig_regex, prefix);
                    }
                }
            }
            else if (typeof helpText[i] == "string") {
                helpText[i] = helpText[i].replace(orig_regex, prefix);
            }
        }

        helpText["color"] = 15105570;
        helpText["author"] = {"name": `${command} Command Help Text`};
        return {"embed": helpText};
    }
}
