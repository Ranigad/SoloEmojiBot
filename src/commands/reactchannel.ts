
import {ReactCommand} from "./react";

export class ReactChannelCommand extends ReactCommand {

    static aliases = ["reactchannel", "rc"];

    constructor(debug = false) {
        super(debug, {config: true, option: "channel"});
    }
}
