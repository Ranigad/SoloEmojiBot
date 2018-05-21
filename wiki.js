"user strict";
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

class Wikia {

    constructor() {
        this.megucaGirlListURL = "http://magireco.wikia.com/wiki/Template:CharacterList";
        this.externalFileName = "./data/wiki.json";
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
        let wikilink = `${wikia}.wikia.com/wiki/`;
        this.serverMap[serverID] = wikilink;
        this.exportData();
        return wikilink;
    }

    addShortcut(serverID, shortcut, page) {
        if (!(serverID in this.customPages)) {
            this.customPages[serverID] = {};
        }
        console.log(shortcut);
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

    linkWikia(server, page) {
        if (server.id in this.serverMap) {
            page = page.join("_");
            if (this.customPages[server.id] === undefined) {
                this.customPages[server.id] = {};
            }
/*
            let megucaCheck = matchMeguca(page);

            if (megucaCheck.length != 0) {
                page = megucaCheck;
            }

            if (page.toLowerCase() in this.customPages[server.id]) {
                page = this.customPages[server.id][page];
            }
// */
            // page = this.customPages[server.id][page.toLowerCase()] || page;

            return `${this.serverMap[server.id]}.wikia.com/wiki/${this.matchMeguca(page) || this.customPages[server.id][page.toLowerCase()] || page}`;
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
        let mappings = {};
        mappings.serverMap = this.serverMap;
        mappings.customPages = this.customPages;
        fs.writeFileSync(this.externalFileName, JSON.stringify(mappings));
    }

    importData() {
        if(fs.existsSync(this.externalFileName)) {
            let mappings = JSON.parse(fs.readFileSync(this.externalFileName));
            this.serverMap = mappings.serverMap;
            this.customPages = mappings.customPages;
        } else {
            console.error("Wiki data file not found.")
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
                this.megucaList = $('p').text().split('\n').join('').split(';');
                // Save in ./data/megucas.json, should be an array of names
                return true;
            } else {
                console.log(`Update Meguca List Error: {err}`);
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

    getMegucaList() {
        return this.megucaList;
    }
}

module.exports.Wikia = Wikia;

