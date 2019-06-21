
import {ReactCommand} from "./react";

export class ReactChannelCommand extends ReactCommand {
    constructor(debug = false) {
        super(debug, {config: true, option: "channel"});
    }
}
