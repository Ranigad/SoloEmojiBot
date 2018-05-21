"use strict";

const BaseCommand = require('../BaseCommand.js');

module.exports = class TestCommand extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        this.permissions = 0;
        this.help = "A test command to be used to test the filesystem scan";
    }

    run(...args) {
        let first = args[0];
        let seconds = args[1];
    }

}