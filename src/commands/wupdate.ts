import {BaseCommand} from "../BaseCommand";
import { Logger } from "../Logger";

import * as path from "path";

export class WUpdateCommand extends BaseCommand {
    basePath: any;
    girl_list: any;

    static aliases = ["wupdate"];

    constructor(debug= false) {
        super(debug);
        this.girl_list = path.normalize(`${this.basePath}/data/megucas.json`);
    }

    run(...args) {
        // Arg[0] === wikia object | Arg[1] === bot object | Arg[2] === message object | Arg[3] === page name

        const [wiki, bot, message, name] = args[0];

        this.print("Updating Magical Girl List", Logger.log);

        return wiki.updateMegucaList();

    }
}
