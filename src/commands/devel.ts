import {BaseCommand} from "../BaseCommand";
import * as Util from "../Util";

export class DevelCommand extends BaseCommand {
    bot: any;

    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, [subcommand, etc, ...remainder]] = args;
        this.bot = bot;
        if (subcommand) {
            let [command, user, channel, value] = [subcommand, message.author, message.channel, etc];
            this.run(subcommand, user, channel, value);
        }

    }

    async run(subcommand, user, channel, value) {
        let permitted = false;

        switch(subcommand) {
            case "clearprofilefetches":
                permitted = await Util.verify_internal_role(user.id, "helper");

                if (permitted == false) {
                    return channel.send("You are not able to clear the pending profile fetches").then(message => {
                        message.delete(5000);
                    });
                }

                this.bot.supportsManager.clearPendingLoads();

                await Util.log_general("Pending profile fetches have been cleared", this.bot);

                return channel.send("The pending profile fetches have been cleared").then(message => {
                    message.delete(10000);
                });
        }
    }

}
