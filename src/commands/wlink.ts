import {BaseCommand} from "../BaseCommand";
import { Logger } from "../Logger";

import * as fs from "fs";
import * as path from "path";

export class WLinkCommand extends BaseCommand {
    title_caps: any;
    title_file: any;
    keywords: any;
    megucaList: any;

    constructor(debug= false) {
        super(debug);
        // this._wiki = wiki;
        const megucaPath = path.normalize(`${this.basePath}/data/megucas.json`);
        this.megucaList = (fs.existsSync(megucaPath) && JSON.parse(fs.readFileSync(megucaPath))) || [];

        const titleCapsPath = path.normalize(`${this.basePath}/cfg/titleCaps.json`);

        if (fs.existsSync(titleCapsPath)) {
            this.title_file = JSON.parse(fs.readFileSync(titleCapsPath));
            this.title_caps = this.title_file.exceptions;
            this.keywords = this.title_file.keywords;
        } else {
            this.title_caps = ["a", "for", "so", "an", "in", "the", "and", "nor", "to", "at", "of", "up", "but", "on",
                            "yet", "by", "or", "le", "la"];
        }
    }

    run(...args) {
        // Arg[0] === wikia object | Arg[1] === bot object | Arg[2] === message object | Arg[3] === page name

        let [wiki, bot, message, page] = args[0];
        const serverID = message.guild.id;
        let search_keyword = " ";

        if (!wiki.customPages[serverID]) {
            wiki.customPages[serverID] = {};
        }

        if (page.length === 2 && this.keywords.includes(page[0].toLowerCase())) {
            search_keyword = page.shift();
        }

        if (page.length === 1) {
            page = page[0];
            // Check for shortcut or matching magical girl, matching girl gets priority (to avoid trolling)
            page = this.matchMeguca(page, search_keyword) || wiki.customPages[serverID][page.toLowerCase()] || page;

            if (!Array.isArray(page)) {
                page = [page];
            }
        }
        this.print(`Page | ${page}`);
        const titleCased = this.titleCase(page);
        this.print(`Title | ${titleCased}`);
        // this.print(args[0]);
        // Check if server exists
        // If it does, then title case page name
        // Return link? Print link?
        Logger.log(wiki.serverMap);
        if (serverID in wiki.serverMap) {  // Change when linked with bot, if server is registered
            // this.print(titleCased, "message.channel.send");
            message.channel.send(`<http:\/\/${wiki.getWiki(serverID)}${titleCased}>`);
        } else {
            // this.print("This server does not have registered wiki.", "message.channel.send");
        }

        return `${wiki.getWiki(serverID)}${titleCased}`;
    }

    titleCase(words) {
        const title_cased_words = [];

        for (let i = 0; i < words.length; i++) {
            // this.print(`${words[i]} in titlecaps is ${this.title_caps.includes(words[i].toLowerCase())}`);
            if (!this.title_caps.includes(words[i].toLowerCase()) || i === 0) {
                title_cased_words.push(words[i].substring(0, 1).toUpperCase() + words[i].substring(1));
            } else {
                title_cased_words.push(words[i]);
            }
        }
        this.print(`Title Cased: ${title_cased_words}`);
        return title_cased_words.join("_");
    }

    // Magical Girl search
    // Check shortcuts (tolower comparison)

    matchMeguca(megucaName, keyword) {
        let matchedmeguca = "";
        let matchedkeyword = false;
        // let lowest = "";
        // let score = 100;
        this.megucaList.forEach((meguca) => {
            // Check if keyword is in string
            if (meguca.toLowerCase().includes(keyword.toLowerCase())) {
                matchedkeyword = true;
            }

            // Checks if the name is inside any of the elements
            // if (meguca.includes(megucaName)) {
            if (matchedkeyword && !matchedmeguca) {
                // this.print(`Testing ${meguca}`);
                const splitName = meguca.split(" ");  // Divide full name into first/last
                splitName.forEach((name) => {
                    // Check passed in name against each name part
                    if (megucaName.toLowerCase() === name.replace(/[()]/g, "").toLowerCase()) {
                        matchedmeguca = splitName;
                    }
                        // lowest = meguca;
                        // score = name.length;
                    // }
                });
                // }
            }
            matchedkeyword = false;
        });

        return matchedmeguca;   // Returns array of split name due to new titleCase function (check if all work)
    }
}
