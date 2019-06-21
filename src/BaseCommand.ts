import { Logger } from "./Logger";

import * as path from "path";

export abstract class BaseCommand {

    static aliases: string[];

    _permissions: number;
    basePath: string;
    debug: boolean;

    constructor(debug = false) {
        this.debug = debug;
        this._permissions = 0;
        this.basePath = path.win32.dirname(require.main.filename);
        // this.basePath = this.basePath.slice(this.basePath.length - 4, 4);
        this.basePath = this.basePath.substring(0, this.basePath.length - 4);
        // Logger.log(this.basePath);
    }

    set permissions(role) {
        this._permissions = role;
    }

    get permissions() {
        return this._permissions;
    }

    abstract run(...args): void;

    handler(...args) {
        this.run(args);
    }

    print(message: string, output = Logger.log) {
        if (this.debug) {
            Logger.log(message);
        } else {
            output(message);
        }
    }

    pathNormalize(normalizePath) {
        return path.normalize(normalizePath);
    }

}
