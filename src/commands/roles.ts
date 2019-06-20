import {BaseCommand} from "../BaseCommand";
import {Role} from "../entity/Role";

import * as Util from "../Util";

import * as typeorm from "typeorm";
const entityManager = typeorm.getManager();

const no_such_role = 1;
const no_permission = 2;

export class RolesCommand extends BaseCommand {

    bot: any;

    constructor(debug: boolean = false) {
        super(debug);
    }

    handler(...args) {
        const [wiki, bot, message, [subcommand, etc, etc2, ...remainder]] = args;
        this.bot = bot;
        if (subcommand) {
            // check mention - subcommand becomes request? or check. Pass in mentioned user, check it's not self
            // check subcommand
            const [command, user, channel, value, value2] = [subcommand, message.author, message.channel, etc, etc2 || 0];
            this.run(command, user, channel, value, value2, remainder.join(" "));
        }
    }

    async run(subcommand, user, channel, value, value2, extra) {
        switch (subcommand) {
            case "set":
                const role_title = value;

                let userid;
                let userid_data = Util.get_user_id_mention(value2, channel, true);

                let fullname = [value2].concat(extra).join(" ");

                if (userid_data.success === true) { userid = userid_data.userid; }
                if (userid === undefined) {
                    userid = Util.get_user_id_or_error(fullname, channel, true);
                }

                if (userid === undefined) {
                    return;
                }

                let permitted = false;

                switch (role_title) {
                    case "developer":
                        permitted = await Util.verify_internal_role(user.id, "developer");
                        break;
                    case "admin":
                        permitted = await Util.verify_internal_role(user.id, "admin");
                        break;
                    case "helper":
                        permitted = await Util.verify_internal_role(user.id, "admin");
                        break;
                }

                if (permitted === false) {
                    return channel.send(`You are not able to make that user a ${role_title}`).then((message) => {
                        message.delete(10000);
                    });
                }

                const success = await this.set_role(userid, role_title, user.id);

                if (success === false) {
                    return channel.send(`You are not able to make that user a ${role_title}`).then((message) => {
                        message.delete(10000);
                    });
                }

                return channel.send(`You have assigned the role "${role_title}" to that user`).then((message) => {
                    message.delete(10000);
                });
            case "get":
                let userid;
                let userid_data = Util.get_user_id_mention(value, channel, true);

                let fullname = [value, value2].concat(extra).join(" ");

                if (userid_data.success === true) { userid = userid_data.userid; }
                if (userid === undefined) {
                    userid = Util.get_user_id_or_error(fullname, channel, true);
                }

                if (userid === undefined) {
                    return;
                }

                const role = await entityManager.getRepository(Role).findOne({username: userid});

                if (role === undefined) {
                    return channel.send("That user does not have a role").then((message) => {
                        message.delete(10000);
                    });
                }

                return channel.send(`That user has the role ${role.role}`).then((message) => {
                    message.delete(10000);
                });
            case "removeall":
                let userid;
                const userid_data = Util.get_user_id_mention(value, channel, true);

                const fullname = [value, value2].concat(extra).join(" ");

                if (userid_data.success === true) { userid = userid_data.userid; }
                if (userid === undefined) {
                    userid = Util.get_user_id_or_error(fullname, channel, true);
                }

                if (userid === undefined) {
                    return;
                }

                let permitted: boolean = await Util.verify_internal_role(user.id, "admin");

                if (permitted === false) {
                    return channel.send(`You are not able to remove that user's role`).then((message) => {
                        message.delete(10000);
                    });
                }

                const successvalue = await this.delete_role(userid, user.id);

                let messageText;

                switch (successvalue) {
                    case no_such_role:
                        messageText = "That user does not have a role";
                        break;
                    case no_permission:
                        messageText = "You are not able to remove that user's role";
                        break;
                    case 0:
                    default:
                        messageText = "You successfully removed that user's role";
                        break;
                }

                return channel.send(messageText).then((message) => {
                    message.delete(10000);
                });
        }
    }

    async set_role(userid, role_title, senderid) {
        let role = await entityManager.getRepository(Role).findOne({username: userid});

        if (role === undefined) {
            role = new Role();
            role.username = userid;
        }

        if (role.role === "developer") {
            const permitted = await Util.verify_internal_role(senderid, "developer");
            if (permitted === false) { return false; }
        }

        role.role = role_title;

        await entityManager.save(role);
        return true;
    }

    async delete_role(userid, senderid) {
        const role = await entityManager.getRepository(Role).findOne({username: userid});

        if (role === undefined) {
            return no_such_role;
        }

        if (role.role === "developer") {
            const permitted = await Util.verify_internal_role(senderid, "developer");
            if (permitted === false) { return no_permission; }
        }

        await entityManager.getRepository(Role).remove(role);
        return 0;
    }

}
