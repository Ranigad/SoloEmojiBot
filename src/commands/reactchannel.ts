
import {ReactCommand} from "./react";

export class ReactChannelCommand extends ReactCommand {

    aliases = ["reactchannel", "rc"];

    constructor(debug = false) {
        super(debug, {config: true, option: "channel"});
    }
}
