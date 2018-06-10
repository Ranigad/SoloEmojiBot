const BaseCommand = require('../BaseCommand.js');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const request = require('request');

module.exports = class WLink extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        //this._wiki = wiki;
        /*
        let titleCapsPath = path.normalize(`${this._basePath}/cfg/titleCaps.json`);

        if (fs.existsSync(titleCapsPath)) {
            this.title_caps = JSON.parse(fs.readFileSync(titleCapsPath));
            this.print(`Title case imported | ${this.title_caps} ${typeof(this.title_caps)} | ${titleCapsPath}`)
        } else {
            this.title_caps = ["a", "for", "so", "an", "in", "the", "and", "nor", "to", "at", "of", "up", "but", "on",
                            "yet", "by", "or", "le", "la"]
        }*/

        this._url = "https://magireco.wikia.com/wiki/Special:Search?query="
        this.page = 0;
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name
        return;
        let [wiki, bot, message, page] = args[0];
        const serverID = message.guild.id;

        this.print(`Page | ${page}`);
        //let titleCased = this.titleCase(page);
        //this.print(`Title | ${titleCased}`);

        let searchquery = page.join(" ");

        request(this._url+searchquery, (err, response, body) => {
            if (err === null) {
                const $ = cheerio.load(body);
                let results = $('li.result').children('article').children('h1').children('a.result-link');
                this.sendEmbed(this.getLink(results));
            } else {
                console.log(err);
                return false;
            }
        });
    }

    titleCase(words) {
        let title_cased_words = [];

        for(let i = 0; i < words.length; i++) {
            this.print(`${words[i]} in titlecaps is ${this.title_caps.includes(words[i].toLowerCase())}`);
            if(this.title_caps.includes(words[i].toLowerCase()) || i == 0) {
                title_cased_words.push(words[i].substring(0,1).toUpperCase() + words[i].substring(1));
            } else {
                title_cased_words.push(words[i]);
            }
        }
        this.print(`Title Cased: ${title_cased_words}`);
        return title_cased_words.join("_");
    }

    getLink(results) {
        let [lower, upper] = [5*this.page, 5*(this.page+1)];
        let subresults = results.slice(lower, upper);

        let display = "";
        for (let i = 0; i < subresults.length; i++) {
            display += `${i}. ${subresults[i].attribs.href}`;
        }

        return display;
    }

    sendEmbed(channel, text) {
        channel.send({embed: {
            "color": 15105570,
            "description": text
        }}).then(sentMessage => {
            if (this.page != 0) {
                sentMessage.react('arrow_left');
            }
            sentMessage.react('one');
            sentMessage.react('two');
            sentMessage.react('three');
            sentMessage.react('four');
            sentMessage.react('five');
            sentMessage.react('regional_indicator_x');

            if (this.page*5 < results.length) {
                sentMessage.react('arrow_right');
            }

            sentMessage.awaitReactions()

            sentMessage.delete(this.calcSeconds('1', 'min')*1000);
            //message.awaitReactions()
        });
    }

    filter(reaction, user) {
        user.id === this.userid && (reaction.emoji.name === "one" ||
    }
}