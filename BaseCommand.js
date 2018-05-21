const path = require('path');

module.exports = class BaseCommand {
    constructor(debug=false) {
        this._permissions = 0;
        this._basePath = path.win32.dirname(require.main.filename);
        this.debug = debug;
    }

    set permissions(role) {
        this._permissions = role;
    }

    get permissions() {
        return this._permissions;
    }

    checkPermissions(role) {
        return role > this._permissions;
    }

    run(...args) {
    }

    handler(...args) {
        this.run(args);
    }

    print(message, output=console.log) {
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