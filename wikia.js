"user strict";
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

class Wikia {

    constructor() {
        this.megucaGirlListURL = "http://magireco.wikia.com/wiki/Template:CharacterList";
        this.externalFileName = "./cfg/serverwikiasettings.json";
        this.megucaList = {}; 
        this.importData();
        this.updateMegucaList();
    }

    setWikia(server, wikia) {
        this.serverMap[server.id] = wikia;
        this.exportData();
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
            this.serverMap = {};
            this.customPages = {};
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
            } else {
                console.log(`Update Meguca List Error: {err}`);
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
            let splitName = meguca.split(' ');
            splitName.forEach((name) => {
                if (megucaName.toLowerCase() === name.toLowerCase()) matchedmeguca = splitName.join('_');
                    //lowest = meguca;
                    //score = name.length;
                //}
            });
            //}
        });
        
        return matchedmeguca;
    }
}

module.exports.Wikia = Wikia;

