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
                this.run(command, message.channel);
            }
        }
    }

    run(command, channel) {
        let embed = this.createEmbed(command);
        channel.send(embed).then(sentMessage => {
                sentMessage.delete(30000);
            });
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