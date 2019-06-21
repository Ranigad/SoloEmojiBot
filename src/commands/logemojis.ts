import {BaseCommand} from "../BaseCommand";

import * as fs from "fs";

import * as sqlite from "sqlite3";
const sqlite3 = sqlite.verbose();

export class LogEmojisCommand extends BaseCommand {
    constructor(debug= false) {
        super(debug);
    }

    run(...args) {}

    logemojis() {
        const db = new sqlite3.Database(`./data/emojis.db`);
        db.all("SELECT * FROM emoji", (err, data) => {
            fs.writeFileSync("./data/emojilog.json", JSON.stringify(data));
            // Logger.log(data)
        });
    }

    backupemojis() {
        const db = new sqlite3.Database(`./data/emojis.db`);
        db.all("SELECT * FROM emoji", (err, data) => {
            fs.writeFileSync("./data/emojilog.json", JSON.stringify(data));
            // Logger.log(data)
        });
    }
}
