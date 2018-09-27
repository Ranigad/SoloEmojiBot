const BaseCommand = require('../BaseCommand.js');
const path = require('path');
const fs = require('fs');
const typeorm = require('typeorm');


module.exports = class Parse extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {
        var supportsManager = bot.supportsManager;
        supportsManager.testFriendsParsing();
        supportsManager.testSupportsParsing();

        return;
    }

}

