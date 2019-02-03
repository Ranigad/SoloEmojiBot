import {BaseCommand} from "../BaseCommand";
const path = require('path');

export class WDeleteCommand extends BaseCommand {
    constructor(debug=false) {
        super(debug);
        //this._wiki = wiki;
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name

        let [wiki, bot, message, shortcut] = args[0];
        //let titleCased = this.titleCase(page);

        this.print(shortcut, console.log);

        if (shortcut.length > 0 && shortcut.length < 2) {
            return wiki.deleteShortcut(message.guild.id, shortcut[0]);
        } else {
            this.print("Invalid argument number.", console.error);
        }
        return false;
        // Check if there is a shortcut
        // Pass into deleteShortcut, checks serverID, existence of shortcut
        // Return true if successful delete, false if not.
    }
}
