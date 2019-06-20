import {ReactCommand} from "./react";

export class ReactNowCommand extends ReactCommand {
    constructor(debug= false) {
        super(debug, {config: true, option: "now"});
    }
}
