import { Logger } from "./Logger";

import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import * as request from "request";

export class Wikia {
    megucaGirlListURL: string;
    externalFileName: string;
    basePath: string;
    megucaList: any;
    serverMap: any;
    customPages: any;

    constructor() {
        this.megucaGirlListURL = "http://magireco.fandom.com/wiki/Template:CharacterList";
        this.basePath = path.win32.dirname(require.main.filename);
        this.basePath = this.basePath.substring(0, this.basePath.length - 4);
        this.externalFileName = this.basePath + "/data/wiki.json";
        this.megucaList = {};
        this.serverMap = {};
        this.customPages = {};

        // Download and Store
        this.updateMegucaList(); // Download and update magical girl list | this.megucaList
        this.importData();  // this.serverMap (Server to wiki), this.customPages (Word to link)
    }

    getServerMap() {
        return this.serverMap;
    }

    getWiki(serverID) {
        return !(serverID in this.serverMap) || this.serverMap[serverID];
    }

    setWiki(serverID, wikia) {
        const wikilink = `${wikia}.fandom.com/wiki/`;
        this.serverMap[serverID] = wikilink;
        this.exportData();
        return wikilink;
    }

    addShortcut(serverID, shortcut, page) {
        if (!(serverID in this.customPages)) {
            this.customPages[serverID] = {};
        }
        Logger.log(shortcut);

        // Check validity
        /*
        request("https://magireco.fandom.com/wiki/Magical_Girls", (err, response, body) => {
            if (err === null) {
                const $ = cheerio.load(body);
                let valid = $('.noarticletext')[0];
                return true;
            } else {
                Logger.log(`Find page error: {err}`);
                return false;
            }
        });*/
        this.customPages[serverID][shortcut.toLowerCase()] = page;
        this.exportData();
    }

    deleteShortcut(serverID, shortcut) {
        if (!(serverID in this.customPages)) {
            this.customPages[serverID] = {};
        }

        shortcut = shortcut.toLowerCase();

        if (shortcut in this.customPages[serverID]) {
            delete this.customPages[serverID][shortcut];
            this.exportData();
            return true;
        } else {
            return false;
        }
    }

    linkWikia(serverID, page) {
        if (serverID in this.serverMap) {
            page = page.join("_");
            if (this.customPages[serverID] === undefined) {
                this.customPages[serverID] = {};
            }
/*
            let megucaCheck = matchMeguca(page);

            if (megucaCheck.length !== 0) {
                page = megucaCheck;
            }

            if (page.toLowerCase() in this.customPages[serverID]) {
                page = this.customPages[serverID][page];
            }
// */
            // page = this.customPages[serverID][page.toLowerCase()] || page;

            return `${this.serverMap[serverID]}${this.matchMeguca(page) || this.customPages[serverID][page.toLowerCase()] || page}`;
        } else {
            return -1;
        }
    }

/*
    customWikiaAdd(server, customName, page) {
        page = page.join("_");
        if (!(server.id in this.customPages)) {
            this.customPages[server.id] = {};
        }
        this.customPages[server.id][customName.toLowerCase()] = page;
        this.exportData();
    }

    customWikiaDelete(server, customName) {
        if (!(server.id in this.customPages)) {
            this.customPages[server.id] = {};
        }
        let shortcut = customName.toLowerCase();
        if (shortcut in this.customPages[server.id]) {
            delete this.customPages[server.id][shortcut];
        } else {
            return -1;
        }
        this.exportData();
    }

// */

    exportData() {
        const mappings = {} as any;
        mappings.serverMap = this.serverMap;
        mappings.customPages = this.customPages;
        fs.writeFileSync(this.externalFileName, JSON.stringify(mappings));
    }

    importData() {
        if (fs.existsSync(this.externalFileName)) {
            const mappings = JSON.parse(fs.readFileSync(this.externalFileName, "utf-8"));
            this.serverMap = mappings.serverMap;
            this.customPages = mappings.customPages;
        } else {
            Logger.error("Wiki data file not found.");
        }
    }

    resetWikia(server) {
        this.serverMap[server.id] = {};
        this.customPages[server.id] = {};
        this.exportData();
    }

    updateMegucaList() {
        request(this.megucaGirlListURL, (err, response, body) => {
            if (err === null) {
                const $ = cheerio.load(body);
                this.megucaList = $("p").text().split("\n").join("").split(";");
                // Logger.log(this.megucaList);
                // Save in ./data/megucas.json, should be an array of names
                fs.writeFileSync("./data/megucas.json", JSON.stringify(this.megucaList));
                return true;
            } else {
                Logger.log(`Update Meguca List Error: {err}`);
                return false;
            }
        });
    }

    matchMeguca(megucaName) {
        let matchedmeguca = "";
        // let lowest = "";
        // let score = 100;
        this.megucaList.forEach((meguca) => {
            // Checks if the name is inside any of the elements
            // if (meguca.includes(megucaName)) {
            const splitName = meguca.split(" ");  // Divide full name into first/last
            splitName.forEach((name) => {
                // Check passed in name against each name part
                if (megucaName.toLowerCase() === name.toLowerCase()) { matchedmeguca = splitName; }// .join('_');
                    // lowest = meguca;
                    // score = name.length;
                // }
            });
            // }
        });

        return matchedmeguca;   // Returns array of split name due to new titleCase function (check if all work)
    }

    getMegucaList() {
        return this.megucaList;
    }
}
