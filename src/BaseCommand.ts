const path = require('path');

export abstract class BaseCommand {
    _permissions: number;
    basePath: string;
    debug: boolean;

    protected constructor(debug = false) {
        this.debug = debug;
        this._permissions = 0;
        this.basePath = path.win32.dirname(require.main.filename);
        //this.basePath = this.basePath.slice(this.basePath.length - 4, 4);
        this.basePath = this.basePath.substring(0, this.basePath.length - 4);
        console.log(this.basePath);
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

    print(message: string, output = console.log) {
        if (this.debug) {
            console.log(message);
        } else {
            output(message);
        }
    }

    pathNormalize(path) {
        return path.normalize(path);
    }

}
