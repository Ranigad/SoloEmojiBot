import {ReactCommand} from "./react";

export class ReactNowCommand extends ReactCommand {

    aliases = ["reactnow", "rn"];

    constructor(debug= false) {
        super(debug, {config: true, option: "now"});
    }
}
