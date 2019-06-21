import {BaseCommand} from "../BaseCommand";

import * as path from "path";

export class WikiCommand extends BaseCommand {

    girl_list: string;

    aliases = ["wiki"];

    constructor(debug= false) {
        super(debug);
        this.girl_list = path.normalize(`${this.basePath}/data/megucas.json`);
        // this._basePath = path.normalize(`${this._basePath}/commands/wiki`);
    }

    run(...args): void {}

}
