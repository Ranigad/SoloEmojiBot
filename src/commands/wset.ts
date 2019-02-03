import {BaseCommand} from "../BaseCommand";

export class WSetCommand extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name

        let [wiki, bot, message, name] = args[0];
        let wikiname = name.join("");

        this.print(message.guild.id);
        return wiki.setWiki(message.guild.id, wikiname);
    }
}
