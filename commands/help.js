const BaseCommand = require('../BaseCommand.js');
const fs = require('fs');

module.exports = class Help extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        this.importHelpFile();
    }

    handler(...args) {
        let [wiki, bot, message, page] = args;
        if (page.length == 0) {
            page = ["help"];
        }

        if (page.length == 1) {
            let command = page[0].substring(0, 1).toUpperCase() + page[0].substring(1).toLowerCase();
            if (command in this.help) {
                this.run(command, message.author, message.guild && message.guild.id = "364704870177046531");
            }
        }
    }

    run(command, channel, madocord = false) {
        let embed = this.createEmbed(command);
        channel.send(embed);
        if (madocord == true && command === "Help"){
            channel.send("Please note: On the /r/MadokaMagica server, the prefix \"\\\" is supported instead of \";\"");
        }
    }

    importHelpFile() {
        this.help = JSON.parse(fs.readFileSync(`${this._basePath}/cfg/help.json`));
    }

    createEmbed(command) {
        let helpText = this.help[command];
        helpText["color"] = 15105570;
        helpText["author"] = {"name": `${command} Command Help Text`};
        return {"embed": helpText};
    }
}
