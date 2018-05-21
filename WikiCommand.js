const BaseCommand = require('../BaseCommand.js');
const path = require('path');

module.exports = class WikiCommand extends BaseCommand {

    constructor(debug=false) {
        super(debug);
        this.girl_list = path.normalize(`${this._basePath}/data/megucas.json`);
        //this._basePath = path.normalize(`${this._basePath}/commands/wiki`);
    }

}