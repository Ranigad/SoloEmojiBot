"use strict";
const BaseCommand = require('../BaseCommand.js');
const sqlite3 = require('sqlite3').verbose();

module.exports = class TestCommand extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        this.permissions = 0;
        this.help = "A test command to be used to test the filesystem scan";
    }

    run(...args) {
        let [wiki, bot, message, [source, time, target]] = args[0];
        //let db = new sqlite3.Database(`./data/emojis.db`);
        //db.run("ALTER TABLE emoji ADD messageid TEXT");
        //console.log(message.mentions.members.first().id);
    }
}