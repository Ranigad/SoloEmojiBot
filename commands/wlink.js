const BaseCommand = require('../BaseCommand.js');
const path = require('path');

module.exports = class WLink extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        //this._wiki = wiki;
        this.title_caps = ["a", "for", "so", "an", "in", "the", "and", "nor", "to", "at", "of", "up", "but", "on",
                            "yet", "by", "or", "le", "la"]
        this.girl_list = path.normalize(`${this._basePath}/data/megucas.json`);
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name

        const serverID = '197546763916279809';

        let [wiki, bot, message, page] = args[0];
        let titleCased = this.titleCase(page);

        this.print(args[0]);
        // Check if server exists
        // If it does, then title case page name
        // Return link? Print link?
        if (Object.keys(wiki.serverMap)[0] in wiki.serverMap) {  // Change when linked with bot
            this.print(titleCased, "message.channel.send");
            this.print(`${wiki.getWiki(serverID)}${titleCased}`, "message.channel.send");
        } else {
            this.print("This server does not have registered wiki.", "message.channel.send");
        }

        return `${wiki.getWiki(serverID)}${titleCased}`;
    }

    titleCase(words) {
        for(let i = 0; i < words.length; i++) {
            if(!this.title_caps.includes(words[i].toLowerCase()) || i == 0) {
                words[i] = words[i].substring(0,1).toUpperCase() + words[i].substring(1);
            }
        }

        return words.join("_");
    }

    // Magical Girl search
    // Check shortcuts (tolower comparison)
}