"use strict";

const ReactCommand = require('./react.js');

module.exports = class ReactChannel extends ReactCommand {
    constructor(debug=false) {
        super(debug, {config: true, option: "channel"});
    }
}
