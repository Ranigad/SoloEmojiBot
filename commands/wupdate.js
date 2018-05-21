const BaseCommand = require('../BaseCommand.js');

module.exports = class WUpdate extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name

        let [wiki, bot, message, name] = args[0];

        this.print("Updating Magical Girl List", console.log);

        return wiki.updateMegucaList();

    }
}