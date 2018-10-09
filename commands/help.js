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
        //this.bot = bot;
        this.message = message;
        this.defaultPrefix = process.env.DISCORD_PREFIX;
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
        let prefix = await Util.get_prefix(this.defaultPrefix, this.message);

        let embed = await this.createEmbed(command, prefix);
        channel.send(embed);
    }

    importHelpFile() {
        this.help = JSON.parse(fs.readFileSync(`${this._basePath}/cfg/help.json`));
    }

    async createEmbed(command, prefix) {
        if (prefix == "\\") {
            prefix = "\\\\";
        }
        let fullCommand = prefix + command.toLowerCase();
        let targetReg = new RegExp('{command}', 'g');
        let helpText = this.help[command];

        helpText = JSON.parse(JSON.stringify(helpText).replace(targetReg, fullCommand));

        helpText["color"] = 15105570;
        helpText["author"] = {"name": `${command} Command Help Text`};
        return {"embed": helpText};
    }
}
