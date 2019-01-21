"use strict";

const ReactCommand = require('./react.js');

module.exports = class ReactNow extends ReactCommand {
    constructor(debug=false) {
        super(debug, {config: true, option: "now"});
    }
}
