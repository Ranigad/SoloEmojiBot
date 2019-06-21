import {ReactCommand} from "./react";

export class ReactNowCommand extends ReactCommand {

    static aliases = ["reactnow", "rn"];

    constructor(debug= false) {
        super(debug, {config: true, option: "now"});
    }
}
