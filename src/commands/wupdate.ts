import {BaseCommand} from "../BaseCommand";
const path = require('path');

export class WUpdateCommand extends BaseCommand {
    basePath: any;
    girl_list: any;

    constructor(debug=false) {
        super(debug);
        this.girl_list = path.normalize(`${this.basePath}/data/megucas.tson`);
    }

    run(...args) {
        // Arg[0] == wikia object | Arg[1] == bot object | Arg[2] == message object | Arg[3] == page name

        let [wiki, bot, message, name] = args[0];

        this.print("Updating Magical Girl List", console.log);

        return wiki.updateMegucaList();

    }
}
