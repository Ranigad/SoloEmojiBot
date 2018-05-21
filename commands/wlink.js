const BaseCommand = require('../BaseCommand.js');
const path = require('path');
const fs = require('fs');

module.exports = class WLink extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        //this._wiki = wiki;
        let megucaPath = path.normalize(`${this._basePath}/data/megucas.json`);
        this.megucaList = (fs.existsSync(megucaPath) && JSON.parse(fs.readFileSync(megucaPath))) || [];

        let titleCapsPath = `${this._basePath`}/cfg/titleCaps.json`;

        if (fs.existsSync(titleCapsPath)) {
            this.print("Title case imported")
            this.title_caps = JSON.parse(fs.readFileSync(titleCapsPath))
        } else {
            this.title_caps = ["a", "for", "so", "an", "in", "the", "and", "nor", "to", "at", "of", "up", "but", "on",
                            "yet", "by", "or", "le", "la"]
        }
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name

        const serverID = '197546763916279809';

        let [wiki, bot, message, page] = args[0];

        if (page.length == 1) {
            // Check for shortcut or matching magical girl, matching girl gets priority (to avoid trolling)
            page = wiki.matchMeguca(page) || wiki.customPages[serverID][page.toLowerCase()] || page;
        }

        let titleCased = this.titleCase(page);

        this.print(args[0]);
        // Check if server exists
        // If it does, then title case page name
        // Return link? Print link?
        if (Object.keys(wiki.serverMap)[0] in wiki.serverMap) {  // Change when linked with bot, if server is registered
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

    matchMeguca(megucaName) {
        let matchedmeguca = "";
        // let lowest = "";
        // let score = 100;
        this.megucaList.forEach((meguca) => {
            // Checks if the name is inside any of the elements
            //if (meguca.includes(megucaName)) {
            let splitName = meguca.split(' ');  // Divide full name into first/last
            splitName.forEach((name) => {
                // Check passed in name against each name part
                if (megucaName.toLowerCase() === name.toLowerCase()) matchedmeguca = splitName;//.join('_');
                    //lowest = meguca;
                    //score = name.length;
                //}
            });
            //}
        });

        return matchedmeguca;   // Returns array of split name due to new titleCase function (check if all work)
    }
}