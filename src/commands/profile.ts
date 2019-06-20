
import * as typeorm from "typeorm";
const entityManager = typeorm.getManager();

import {BaseCommand} from "../BaseCommand";
import {Friend} from "../entity/Friend";
import {MagiRecoUser} from "../entity/MagiRecoUser";
import {User} from "../entity/User";
import { Logger } from "../Logger";
import * as TranslationHandler from "../TranslationHandler";
import * as Util from "../Util";

export class ProfileCommand extends BaseCommand {

    bot: any;
    production_server: string = process.env.PROD_SERVER;
    test_server: string = process.env.TEST_SERVER;

    constructor(debug= false) {
        super(debug);
        this.permissions = 0;
    }

/*
- create your profile -> follow up message, yes or no on notification
- Set your profileID
- Check someone's profileID
- Remove your profileID
- (public/private?)
- Request to Add someone
- list all profiles
*/

    handler(...args) {
        const [wiki, bot, message, [subcommand, etc, etc2, ...remainder]] = args;
        this.bot = bot;
        if (subcommand) {
            // check mention - subcommand becomes request? or check. Pass in mentioned user, check it's not self
            // check subcommand
            const [command, user, channel, value, value2] = [subcommand, message.author, message.channel, etc, etc2 || 0];
            this.run(command, user, channel, value, value2, remainder.join(" "));
        } else {
            this.run("check", message.author, message.channel, undefined, remainder.join(" "), undefined);
            Logger.log("check");
            // do a self profile check
        }
    }

    async run(subcommand, user, channel, value, value2, extra) {
        let fullNameArray = [];
        if (extra) {
            fullNameArray = [value, value2].concat(extra);
        } else if (value2) {
            fullNameArray = [value, value2];
        } else if (value) {
            fullNameArray = [value];
        } else {
            fullNameArray = [];
        }
        let fullName = fullNameArray.join(" ");
        let userid;

        switch (subcommand.toLowerCase()) {
            case "recreate":
            case "create":  // --
                Logger.log("create");
                if (value) {
                    this.create(channel, user, value);
                } else {
                    channel.send(`Error: You need to provide your friend ID`).then((message) => {
                        message.delete(5000);
                    });
                }
                break;
            case "set": // set with target as userid
            case "change":
                Logger.log("set");
                Logger.log(value);
                const settings = ["id"];
                if (value && settings.includes(value)) {
                    if (value2) {
                        this.set(channel, user.id, value, value2);
                    } else {
                        channel.send(`Error: You need to provide your ${value}`).then((message) => {
                            message.delete(5000);
                        });
                    }
                } else {
                    channel.send(`Error: Use \`;profile ${subcommand} id in-game-id\` to ${subcommand} your id.`)
                    .then((message) => {
                        message.delete(5000);
                    });
                }
                break;
            case "mentions":
            case "notifications":
            case "notify":    // turn on off notifications use set but with notification as target
                Logger.log("notifications");
                const valuemap = {on: true, off: false};
                if (value in valuemap) {
                    this.set(channel, user.id, "notifications", valuemap[value]);
                } else {
                    channel.send(`Error: Please use ;profile ${subcommand} on or ;profile ${subcommand} off`)
                    .then((message) => {
                        message.delete(10000);
                    });
                }
                break;
            case "profile":
            case "check": {
                Logger.log("mention");
                let cselfcheck = false;
                if (value) {

                    userid = Util.get_user_id_or_error(value, channel, true);
                    const useridfull = Util.get_user_id_or_error(fullName, channel, true);
                    if (userid === undefined && useridfull === undefined) { return; }
                }
                if (userid === undefined) {
                    userid = user.id;
                    cselfcheck = true;
                }
                this.check(channel, userid, cselfcheck);
                break;
            }
            case "support":
            case "supports": {
                Logger.log("supports");
                let sselfcheck = false;
                if (value) {

                    userid = Util.get_user_id_or_error(value, channel, true);
                    const useridfull = Util.get_user_id_or_error(fullName, channel, true);
                    if (userid === undefined && useridfull === undefined) { return; }
                }
                if (userid === undefined) {
                    userid = user.id;
                    sselfcheck = true;
                }
                this.supports(channel, userid, sselfcheck);
                break;
            }
            case "follow": {
                Logger.log("follow");
                if (value) {
                    userid = Util.get_user_id_or_error(value, channel, true);
                    const useridfull = Util.get_user_id_or_error(fullName, channel, true);
                    if (userid === undefined && useridfull === undefined) {
                        return;
                    }
                    this.follow(channel, user.id, userid);
                } else {
                    channel.send("Error: Please mention a user to friend, using a ping, name#discriminator, or ID")
                    .then((message) => {
                        message.delete(5000);
                    });
                }
                break;
            }
            case "following":
                Logger.log("following");
                this.following(channel, user.id);
                break;
            case "followers":
                Logger.log("followers");
                this.followers(channel, user.id);
                break;
            case "mutuals":
                Logger.log("friends");
                this.mutuals(channel, user.id);
                break;
            case "unfollow": {
                Logger.log("unfollow");
                if (value) {
                    userid = Util.get_user_id_or_error(value, channel, true);
                    const useridfull = Util.get_user_id_or_error(fullName, channel, true);
                    if (userid === undefined && useridfull === undefined) {
                        return;
                    }
                    this.unfollow(channel, user.id, userid);
                } else {
                    channel.send("Error: Please mention a user to unfollow, using a ping, name#discriminator, or ID")
                    .then((message) => {
                        message.delete(5000);
                    });
                }
                break;
            }
            case "delete":
                this.delete(channel, user.id);
                break;
            case "list":
                if (value) {
                    const page = parseInt(value, 10);
                    Logger.log(page);
                    this.list(channel, page);
                } else { this.list(channel, 1); }
                break;
            case "exporttranslations":
                if (channel.guild.id !== this.production_server) {
                    TranslationHandler.export_data(channel);
                    break;
                }
            case "count":
                const profilecount = await entityManager.getRepository(User).count();
                channel.send(`There are currently ${profilecount} created profiles`).then((message) => {
                    message.delete(50000);
                });
                break;
            default:
                let selfcheck = false;
                if (subcommand) {
                    fullName = ([subcommand].concat(fullNameArray)).join(" ");
                    let userdata = Util.get_user_id_mention(fullName, channel.guild, true);
                    if (userdata.success === false) {
                        userdata = Util.get_user_id_mention(subcommand, channel.guild, true);
                    }
                    if (userdata.success === true) {
                        userid = userdata.userid;
                        this.check(channel, userid, selfcheck);
                    } else {
                        if (userdata.reason === 0) {
                            return channel.send("The given user could not be found.  They may not be in the server now")
                            .then((message) => {
                                message.delete(10000);
                            });
                        } else {
                            Logger.log("Error happened");
                            return channel.send(
                                `There was an error with your command: ";profile ${fullName}".
                                Use ;help profile for supported commands`
                            )
                            .then((message) => {
                                message.delete(10000);
                            });
                        }
                    }
                }
                if (userid === undefined) {
                    userid = user.id;
                    selfcheck = true;
                    this.check(channel, userid, selfcheck);
                }
        }

    }

    async is_mutual(user_a, user_b) {
        const friend = await this.check_friends(user_a, user_b);
        if (friend.a_follows === true && friend.b_follows === true) { return true; } else { return false; }
    }

    async does_follow(follower, followee) {
        const friend = await this.check_friends(follower, followee);
        if (friend.user_a === follower && friend.a_follows === true) { return true; }
        if (friend.user_b === follower && friend.b_follows === true) { return true; }
        return false;
    }

    async create(channel, discorduser, profile) {
        // Create new profile, then send message and check if notifications want to be turned on
        if (this.msg_if_restricted_channel(channel)) { return; }
        let user = await entityManager.getRepository(User).findOne({username: discorduser.id});
        const userid = discorduser.id;
        let mode;
        let recreated = false;

        if (user !== undefined && user.deleted === false) {
            Logger.log("User already exists - updating");
            mode = "updated";
        } else if (user !== undefined) {
            Logger.log("Restoring user");
            user.deleted = false;
            user.notifications = false;
            mode = "created";
            recreated = true;
        } else {
            Logger.log("Creating new user");
            user = new User();
            user.addtimestamp = new Date().toUTCString();
            mode = "created";
        }

        user.username = discorduser.id;
        user.discordname = discorduser.username;
        user.discriminator = discorduser.discriminator;
        user.friend_id = profile;

        await entityManager.save(user);

        channel.send(`Your profile has been ${mode}`).then(async (message) => {

            const gameUser = await entityManager.getRepository(MagiRecoUser)
                .findOne({where: {friend_id: user.friend_id}});
            if (gameUser === undefined) {
                const request = {inviteCode: user.friend_id, id: undefined, callback: this.handle_retrieved_new_account,
                    message, initialmessage: "", user, bmfun: undefined};
                Logger.log(user);
                this.bot.supportsManager.fetchUserWithInvite(request);
            }

            if (mode === "created") {
                channel.send(`Reply ;profile notify on to enable notifications from other players`)
                .then((delMsg) => {});
            } else {
                message.delete(10000);
            }
        });

        if (recreated) {
            const discordsender = this.bot.users.get(userid);

            const mutuals = await this.mutuals_entities(userid);
            for (const mutualUser of mutuals) {
                const discordrecipient = this.bot.users.get(mutualUser.username);
                mutualUser.discordname = discordrecipient.username;
                mutualUser.discriminator = discordrecipient.discriminator;
                entityManager.save(mutualUser);

                if (mutualUser.deleted === false && mutualUser.notifications) {
                    discordrecipient.send(
                        `Your former mutual follower, <@${userid}> (${discordsender.username}) recreated their Mokyuu Profiles profile`
                    );
                }
            }

            const following = await this.following_entities(userid);
            for (const followUser of following) {
                const discordrecipient = this.bot.users.get(followUser.username);
                followUser.discordname = discordrecipient.username;
                followUser.discriminator = discordrecipient.discriminator;
                entityManager.save(followUser);

                const mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
                if (followUser.deleted === false && followUser.notifications && !mutual_relationship) {
                    discordrecipient.send(`Your former follower, <@${userid}> (${discordsender.username}) recreated their Mokyuu Profiles profile`);
                }
            }

            const followers = await this.followers_entities(userid);
            for (const followUser of followers) {
                const discordrecipient = this.bot.users.get(followUser.username);
                followUser.discordname = discordrecipient.username;
                followUser.discriminator = discordrecipient.discriminator;
                entityManager.save(followUser);

                const mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
                if (followUser.deleted === false && followUser.notifications && !mutual_relationship) {
                    discordrecipient.send(
                        `<@${userid}> (${discordsender.username}), who you had followed, recreated their Mokyuu Profiles profile`
                    );
                }
            }
        }
    }

    handle_retrieved_new_account(success, message, initialMessage, inviteCode, user, build_message) {
        const mention = `<@${user.username}>`;
        const channel = message.channel;
        if (success === false) {
            channel.send(`${mention}, your support data couldn't get fetched.  Please double check your friend id and try again`);
        } else {
            channel.send(`${mention}, your support data was successfully fetched!  Use ;profile or ;profile supports to view your data`);
        }
    }

    error_if_no_profile(user, channel) {
        if (user === undefined || user.deleted === true) {
            channel.send("Your profile was deleted or does not exist.  Use ;profile create <friend-ID>")
            .then((message) => {
                message.delete(10000);
            });
            return true;
        }
        return false;
    }

    msg_if_restricted_channel(channel) {
        if (channel !== undefined && channel.guild !== undefined && channel.guild.id !== this.test_server
            && !channel.name.includes("bot")) {
                if (channel.guild.id === this.production_server) {
                    channel.send("You can only use this command in the #bot-commands chanel").then((message) => {
                        message.delete(10000);
                    });
                } else {
                    channel.send("You can only use this command in a bot channel").then((message) => {
                        message.delete(10000);
                    });
                }
                return true;
        }
        return false;
    }

    set(channel, userid, target, value) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        entityManager.getRepository(User).findOne({username: userid}).then((user) => {
            const error = this.error_if_no_profile(user, channel);
            if (error) { return; }
            // Check which is being changed, then change:
            if (target === "id") {
                typeorm.getConnection().createQueryBuilder()
                    .update(User).set({friend_id: value})
                    .where("username = :username", {username: userid})
                    .execute();
                channel.send("Your friend ID has been updated").then((message) => {
                    message.delete(10000);
                });
            } else if (target === "notifications") {
                typeorm.getConnection().createQueryBuilder()
                    .update(User).set({notifications: value})
                    .where("username = :username", {username: userid})
                    .execute();
                channel.send("Your notifications have been updated").then((message) => {
                    message.delete(10000);
                });
            }
        });
    }

    async check(channel, userid, selfcheck) {
        const user = await entityManager.getRepository(User).findOne({username: userid});
        if (user === undefined || user.deleted === true) {
            if (selfcheck) {
                return channel.send("Your profile does not exist or was deleted.  Use ;profile create friend-id to create it")
                .then((delMsg) => {
                    delMsg.delete(5000);
                });
            }
            return channel.send("That user does not have a profile or their profile was deleted").then((delMsg) => {
                delMsg.delete(5000);
            });
        }

        const discorduser = channel.guild.members.get(userid).user;
        user.discordname = discorduser.username;
        user.discriminator = discorduser.discriminator;

        entityManager.save(user);

        const initialMessageTxt = `${user.discordname}#${user.discriminator}: **Friend ID**: ${user.friend_id}`;
        let messageTxt = initialMessageTxt;
        messageTxt = await this.build_check_message(messageTxt, user.friend_id, user);

        let userId;

        const gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: user.friend_id}, relations: ["meguca", "meguca.masterMeguca"]});

        if (gameUser !== undefined && gameUser.user_id !== undefined) { userId = gameUser.user_id; }

        const message = await channel.send(messageTxt);
        Logger.log(messageTxt);
        messageTxt = messageTxt.replace(`${user.discordname}#${user.discriminator}`, `<@${user.username}>`);
        await message.edit("");
        Logger.log(messageTxt);
        await message.edit(messageTxt);
        // Update data if necessary
        let updateneeded = false;
        if (gameUser === undefined) { updateneeded = true; } else {
            const timeNow = Date.now();
            const updateTime = Date.parse(gameUser.updatetimestamp);
            const hours = Math.abs(timeNow - updateTime) / 36e5;
            if (hours > 21) { updateneeded = true; }
        }
        if (updateneeded) {
            messageTxt += " Updating... <a:mokyuuwork:494356712883617812>";
            await message.edit(messageTxt);
            const request = {inviteCode: user.friend_id, id: userId, callback: this.edit_sent_message,
                message, initialmessage: initialMessageTxt, user, bmfun: this.build_check_message};
            if (userId !== undefined) {
                this.bot.supportsManager.fetchUserWithId(request);
            } else { this.bot.supportsManager.fetchUserWithInvite(request); }
        }
    }

    async edit_sent_message(success, message, initialMessage, inviteCode, user, build_message) {
        let messageTxt = await build_message(initialMessage, inviteCode, user);
        if (success === false) {
            messageTxt = `<@${user.username}>: **Friend ID**: ${user.friend_id}\nUpdate failed - an error occurred.`;
        } else {
            messageTxt += "   The data was updated succesfully";
        }
        messageTxt = messageTxt.replace(`${user.discordname}#${user.discriminator}`, `<@${user.username}>`);
        await message.edit("");
        await message.edit(messageTxt);
    }

    async build_check_message(messageTxt, friendId, user) {
        const gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: friendId}, relations: ["meguca", "meguca.masterMeguca"]});

        if (gameUser !== undefined) {
            messageTxt = `${user.discordname}#${user.discriminator}:
            **Friend ID**: ${user.friend_id}
            **Display Name**: ${gameUser.display_name}
            **Rank**: ${gameUser.user_rank}`;
            const girls = gameUser.meguca;

            if (girls !== undefined && girls.length !== 0) {
                girls.sort((a, b) => (a.support_type > b.support_type) ? 1 : ((b.support_type > a.support_type) ? -1 : 0));

                const attributes = [
                    "<:att_void:494355788886704138>",
                    "<:att_fire:494355788878315520>",
                    "<:att_water:494355788681183233>",
                    "<:att_timber:494355788916326401>",
                    "<:att_light:494355788870057984>",
                    "<:att_dark:494355788496764942>"
                ];

                messageTxt += "\n";
                for (const girl of girls) {
                    const attribute = girl.masterMeguca.meguca_type;
                    if (attribute > 0 && attribute < 7) { messageTxt += `${attributes[attribute - 1]} `; }
                    messageTxt += `**${(girl.masterMeguca.nick) ? girl.masterMeguca.nick : girl.masterMeguca.jpn_name}**`;
                    messageTxt += `・${girl.slots}s・Lv${girl.level}・${(girl.magia_level === 6) ? "Doppel" : "Magia" + girl.magia_level} `;
                }
            }

            messageTxt += `\nUpdated: ${gameUser.updatetimestamp}`;
        }
        return messageTxt;
    }

    async supports(channel, userid, selfcheck) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        const user = await entityManager.getRepository(User).findOne({username: userid});
        if (user === undefined || user.deleted === true) {
            if (selfcheck) {
                return channel.send("Your profile does not exist or was deleted.  Use ;profile create to create it")
                .then((delMsg) => {
                    delMsg.delete(5000);
                });
            }
            return channel.send("That user does not have a profile or their profile was deleted")
            .then((delMsg) => {
                delMsg.delete(5000);
            });
        }

        const discorduser = channel.guild.members.get(userid).user;
        user.discordname = discorduser.username;
        user.discriminator = discorduser.discriminator;

        entityManager.save(user);

        const initialMessageTxt = `${user.discordname}#${user.discriminator}: **Friend ID**: ${user.friend_id}`;
        let messageTxt = initialMessageTxt;
        messageTxt = await this.build_supports_message(messageTxt, user.friend_id, user);

        let userId;

        const gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: user.friend_id}, relations: ["meguca", "meguca.masterMeguca"]});

        if (gameUser !== undefined && gameUser.user_id !== undefined) {
            userId = gameUser.user_id;
        } else {
            messageTxt += "\nNo support data exists for that player currently... ";
        }

        const message = await channel.send(messageTxt);
        messageTxt = messageTxt.replace(`${user.discordname}#${user.discriminator}`, `<@${user.username}>`);
        await message.edit("");
        await message.edit(messageTxt);
        // Update data if necessary
        let updateneeded = false;
        if (gameUser === undefined) { updateneeded = true; } else {
            const timeNow = Date.now();
            const updateTime = Date.parse(gameUser.updatetimestamp);
            const hours = Math.abs(timeNow - updateTime) / 36e5;
            if (hours > 21) { updateneeded = true; }
        }
        if (updateneeded) {
            messageTxt += " Updating... <a:mokyuuwork:494356712883617812>";
            await message.edit(messageTxt);
            const request = {inviteCode: user.friend_id, id: userId, callback: this.edit_sent_message,
                message, initialmessage: initialMessageTxt, user, bmfun: this.build_supports_message};
            if (userId !== undefined) {
                this.bot.supportsManager.fetchUserWithId(request);
            } else { this.bot.supportsManager.fetchUserWithInvite(request); }
        }
    }

    async build_supports_message(messageTxt, friendId, user) {
        const gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: friendId}, relations: [
                "meguca", "meguca.masterMeguca", "meguca.memes", "meguca.memes.masterMemoria"
            ]});

        if (gameUser !== undefined) {
            messageTxt = `${user.discordname}#${user.discriminator}:
            **Friend ID**: ${user.friend_id}
            **Display Name**: ${gameUser.display_name}
            **Rank**: ${gameUser.user_rank}`;
            const girls = gameUser.meguca;

            if (girls !== undefined && girls.length !== 0) {
                girls.sort((a, b) => (a.support_type > b.support_type) ? 1 : ((b.support_type > a.support_type) ? -1 : 0));

                const attributes = [
                    "<:att_void:494355788886704138>",
                    "<:att_fire:494355788878315520>",
                    "<:att_water:494355788681183233>",
                    "<:att_timber:494355788916326401>",
                    "<:att_light:494355788870057984>",
                    "<:att_dark:494355788496764942>"
                ];

                for (const girl of girls) {
                    messageTxt += "\n";
                    const attribute = girls.masterMeguca.meguca_type;
                    if (attribute > 0 && attribute < 7) { messageTxt += `${attributes[attribute - 1]} `; }
                    messageTxt += `**${(girl.masterMeguca.eng_sur && girl.masterMeguca.eng_given)
                        ? girls.masterMeguca.eng_sur + " " + girl.masterMeguca.eng_given
                        : (girl.masterMeguca.nick) ? girl.masterMeguca.nick : girl.masterMeguca.jpn_name}** `;
                    messageTxt += `・${girl.slots}s・Lv${girl.level}・${(girl.magia_level === 6) ? "Doppel" : "Magia" + girl.magia_level} `;
                    messageTxt += `\n${girl.hp} HP・${girl.attack} ATK・${girl.defense} DEF`;

                    for (const meme of girl.memes) {
                        const masterMeme = meme.masterMemoria;
                        const rating = masterMeme.rating;
                        const lbCount = meme.lbCount;
                        const level = meme.level;
                        const maxLevel = (rating === 4) ? 30 + 5 * lbCount : 5 + rating * 5 + 5 * lbCount;
                        let levelString = `${level}/${maxLevel}`;
                        levelString = (lbCount === 4) ? "**Lvl " + levelString + " (MLB)**" : "Lvl " + levelString;
                        const memeName = masterMeme.eng_name ? masterMeme.eng_name : masterMeme.jpn_name;
                        messageTxt += `\n${memeName}・${levelString}`;
                    }
                }
            }

            messageTxt += `\nUpdated: ${gameUser.updatetimestamp}`;
        }
        return messageTxt;
    }

    // Send follow / follow-back
    async follow(channel, senderid, recipientid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        let user = await entityManager.getRepository(User).findOne({username: senderid});
        const error = this.error_if_no_profile(user, channel);
        if (error) { return; }

        if (senderid === recipientid) {
            return channel.send("You cannot follow yourself").then((message) => {
                message.delete(5000);
            });
        }

        user = await entityManager.getRepository(User).findOne({username: recipientid});
        if (user === undefined || user.deleted === true) {
            return channel.send("That user does not have a profile or their profile was deleted").then((message) => {
                message.delete(5000);
            });
        }

        const discordrecipient = this.bot.users.get(recipientid);
        user.discordname = discordrecipient.username;
        user.discriminator = discordrecipient.discriminator;
        entityManager.save(user);

        const discordsender = this.bot.users.get(senderid);

        const friend: Friend = await this.check_friends(senderid, recipientid);

        const newUserName = `${user.discordname}#${user.discriminator}`;

        if (friend !== undefined) {
            if (friend.a_follows === true && friend.b_follows === true) {
                return channel.send(`You are already following ${newUserName}`)
                .then((message) => {
                    message.edit(`You are already following <@${user.username}>`);
                });
            }

            if ((friend.user_a === senderid && friend.a_follows === true)
            || (friend.user_b === senderid && friend.b_follows === true)) {
                return channel.send(`You have already followed ${newUserName}`)
                .then((message) => {
                    message.edit(`You have already followed <@${user.username}>`);
                });
            }

            // If neither of these are true, then someone else sent them a friend request previously - accept friends
            if (friend.a_follows === true) { friend.b_follows = true; } else { friend.a_follows = true; }
            entityManager.save(friend);

            channel.send(`You are now mutually following ${newUserName}.  Make sure to follow them ingame`)
            .then((message) => {
                message.edit(`You are now mutually following <@${user.username}>.  Make sure to follow them ingame`);
            });

            if (user.deleted === false && user.notifications) {
                discordrecipient.send(
                    `<@${senderid}> (${discordsender.username}) followed you back on Mokyuu Profiles!
                    Make sure to follow them ingame`
                );
            }
            return;
        }

        // A friend relation does not already exist --> create one:
        const newFriend: Friend = new Friend();
        newFriend.user_a = senderid;
        newFriend.user_b = recipientid;
        newFriend.a_follows = true;
        Logger.log(newFriend);
        entityManager.save(newFriend);

        if (user.notifications) {

            // tslint:disable-next-line
            discordrecipient.send(`You have been followed by <@${senderid}> (${discordsender.username}) on Mokyuu Profiles! In a bot commands channel, use ;profile follow ${discordsender.username}#${discordsender.discriminator} to accept or ;profile check ${discordsender.username}#${discordsender.discriminator} to view their info`);

            return channel.send(`You have followed ${user.discordname}#${user.discriminator}!`).then((message) => {
                message.edit(`You have followed <@${user.username}>!`);
            });
        }

        // tslint:disable-next-line
        return channel.send(`You have followed ${user.discordname}#${user.discriminator}.  Please note, they do not have notifications on.`).then((message) => {
            message.edit(`You have followed <@${user.username}>.  Please note, they do not have notifications on.`);
        });
    }

    // Get follow/friend relationship
    async check_friends(user1, user2) {
        let friend: Friend = await entityManager.getRepository(Friend).findOne({user_a: user1, user_b: user2});
        if (friend !== undefined) {
            return friend;
        }

        friend = await entityManager.getRepository(Friend).findOne({user_b: user1, user_a: user2});
        return friend;
    }

    async mutuals_entities(userid) {
        const friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_b")
                    .from(Friend, "friend")
                    .where("friend.user_a = :username", {username: userid})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .andWhere("friend.b_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .orWhere((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_a")
                    .from(Friend, "friend")
                    .where("friend.user_b = :username", {username: userid})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .andWhere("friend.b_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .getMany();
        return friends;
    }

    // Mutual follows
    async mutuals(channel, senderid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        const user = await entityManager.getRepository(User).findOne({username: senderid});
        const error = this.error_if_no_profile(user, channel);
        if (error) { return; }

        const friends = await this.mutuals_entities(senderid);

        if (friends.length === 0) {
            return channel.send("You currently do not have any mutual follows.  Use ;profile follow to follow players").then((message) => {
                message.delete(5000);
            });
        }

        let initialmessage = "**Your Mutual Follows**:";
        let finalmessage = initialmessage;
        let count = 0;

        for (const friend of friends) {
            if (friend.deleted === true) { continue; }
            const gameUser = await entityManager.getRepository(MagiRecoUser)
                .findOne({where: {friend_id: friend.friend_id}});
            const userInfo = `${friend.friend_id}${(gameUser !== undefined) ? " (" + gameUser.display_name + ")" : ""}`;
            initialmessage += `\n★ ❤️ ${friend.discordname}#${friend.discriminator}: ${userInfo}`;
            finalmessage += `\n★ ❤️ <@${friend.username}>: ${userInfo}`;
            count++;
        }

        if (count === 0) {
            return channel.send("You currently do not have any mutual follows.  Use ;profile follow to follow players")
            .then((message) => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then((message) => {
            message.edit(finalmessage).then((delMsg) => {
                delMsg.delete(50000);
            });
        });
    }

    async followers_entities(userid) {
        const friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_b")
                    .from(Friend, "friend")
                    .where("friend.user_a = :username", {username: userid})
                    .andWhere("friend.b_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .orWhere((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_a")
                    .from(Friend, "friend")
                    .where("friend.user_b = :username", {username: userid})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .getMany();
        return friends;
    }

    async followers(channel, senderid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        const user = await entityManager.getRepository(User).findOne({username: senderid});
        const error = this.error_if_no_profile(user, channel);
        if (error) { return; }

        const friends = await this.followers_entities(senderid);

        if (friends.length === 0) {
            return channel.send("You currently do not have any followers").then((message) => {
                message.delete(5000);
            });
        }

        let initialmessage = "**Your Followers**:";
        let finalmessage = initialmessage;
        let count = 0;

        for (const friend of friends) {
            if (friend.deleted === true) { continue; }
            const friendship = await this.check_friends(senderid, friends[i].username);
            initialmessage += "\n★ ";
            finalmessage += "\n★ ";
            if (friendship !== undefined && friendship.a_follows === true && friendship.b_follows === true) {
                initialmessage += "❤️ ";
                finalmessage += "❤️ ";
            }
            const gameUser = await entityManager.getRepository(MagiRecoUser)
                .findOne({where: {friend_id: friend.friend_id}});
            const userInfo = `${friend.friend_id}${(gameUser !== undefined) ? " (" + gameUser.display_name + ")" : ""}`;
            initialmessage += `${friend.discordname}#${friend.discriminator}: ${userInfo}`;
            finalmessage += `<@${friend.username}>: ${userInfo}`;
            count++;
        }

        if (count === 0) {
            return channel.send("You currently do not have any followers").then((message) => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then((message) => {
            message.edit(finalmessage).then((delMsg) => {
                delMsg.delete(50000);
            });
        });
    }

    async following_entities(userid) {
        const friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_b")
                    .from(Friend, "friend")
                    .where("friend.user_a = :username", {username: userid})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .orWhere((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_a")
                    .from(Friend, "friend")
                    .where("friend.user_b = :username", {username: userid})
                    .andWhere("friend.b_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .getMany();
        return friends;
    }

    async following(channel, senderid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        const user = await entityManager.getRepository(User).findOne({username: senderid});
        const error = this.error_if_no_profile(user, channel);
        if (error) { return; }

        const friends = await this.following_entities(senderid);

        if (friends.length === 0) {
            return channel.send("You currently do not follow anyone.  Use ;profile follow to follow players")
            .then((message) => {
                message.delete(5000);
            });
        }

        let initialmessage = "**Following**:";
        let finalmessage = initialmessage;
        let count = 0;

        for (const friend of friends) {
            if (friends.deleted === true) { continue; }
            const friendship = await this.check_friends(senderid, friends[i].username);
            initialmessage += "\n★ ";
            finalmessage += "\n★ ";
            if (friendship && friendship.a_follows === true && friendship.b_follows === true) {
                initialmessage += "❤️ ";
                finalmessage += "❤️ ";
            }
            const gameUser = await entityManager.getRepository(MagiRecoUser)
                .findOne({where: {friend_id: friend.friend_id}});
            const userInfo = `${friend.friend_id}${(gameUser !== undefined) ? " (" + gameUser.display_name + ")" : ""}`;
            initialmessage += `${friend.discordname}#${friend.discriminator}: ${userInfo}`;
            finalmessage += `<@${friend.username}>: ${userInfo}`;
            count++;
        }

        if (count === 0) {
            return channel.send("You currently do not follow anyone.  Use ;profile follow to follow players")
            .then((message) => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then((message) => {
            message.edit(finalmessage).then((delMsg) => {
                delMsg.delete(50000);
            });
        });
    }

    /** @deprecated */
    async requests(channel, senderid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        const user = await entityManager.getRepository(User).findOne({username: senderid});
        const error = this.error_if_no_profile(user, channel);
        if (error) { return; }

        const friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where((qb) => {
                const subQuery = qb.subQuery()
                    .select("friend.user_a")
                    .from(Friend, "friend")
                    .where("friend.user_b = :username", {username: senderid})
                    .andWhere("friend.b_follows = :value", {value: false})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .getMany();

        if (friends.length === 0) {
            return channel.send("You currently do not have any non-mutual follows").then((message) => {
                message.delete(5000);
            });
        }

        let initialmessage = "**Non-Mutual Follows**:";
        let finalmessage = initialmessage;
        let count = 0;

        for (const friend of friends) {
            if (friend.deleted === true) { continue; }
            const gameUser = await entityManager.getRepository(MagiRecoUser)
                .findOne({where: {friend_id: friend.friend_id}});
            const userInfo = `${friend.friend_id}${(gameUser !== undefined) ? " (" + gameUser.display_name + ")" : ""}`;
            initialmessage += `\n★ ${friend.discordname}#${friend.discriminator}: ${userInfo}`;
            finalmessage += `\n★ <@${friend.username}>: ${userInfo}`;
            count++;
        }

        if (count === 0) {
            return channel.send("You currently do not have any non-mutual follows").then((message) => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then((message) => {
            message.edit(finalmessage).then((delMsg) => {
                delMsg.delete(50000);
            });
        });
    }

    async unfollow(channel, senderid, userid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        let user = await entityManager.getRepository(User).findOne({username: senderid});
        const error = this.error_if_no_profile(user, channel);
        if (error) { return; }

        user = await entityManager.getRepository(User).findOne({username: userid});
        if (user === undefined || user.deleted === true) {
            return channel.send("That user does not have a profile or their profile was deleted")
            .then((message) => {
                message.delete(5000);
            });
        }
        const bot_user = user;

        const checkUser = this.bot.users.get(userid);
        const sender = this.bot.users.get(senderid);

        const friend = await this.check_friends(senderid, userid);
        if (friend === undefined
        || (friend.a_follows === false && friend.user_a === senderid)
        || (friend.user_b === senderid && friend.b_follows === false)) {
            return channel.send(`You are not following ${checkUser.username}#${checkUser.discriminator}`)
            .then((message) => {
                message.edit(`You are not following <@${userid}>`).then((delMsg) => {
                    delMsg.delete(5000);
                });
            });
        }

        if (friend.user_a === senderid) {
            friend.a_follows = false;
        } else { friend.b_follows = false; }

        if (friend.a_follows === false && friend.b_follows === false) {
            entityManager.remove(friend);
        } else {
            entityManager.save(friend);
        }

        channel.send(`You are no longer following  ${checkUser.username}#${checkUser.discriminator}`).then((message) => {
            message.edit(`You are no longer following <@${userid}>`).then((delMsg) => {
                delMsg.delete(5000);
            });
        });

        if (bot_user.deleted === false && bot_user.notifications) {
            checkUser.send(`<@${senderid}> (${sender.username}) has unfollowed you on Mokyuu Profiles`);
        }
    }

    async delete(channel, userid) {
        if (this.msg_if_restricted_channel(channel)) { return; }
        const user = await entityManager.getRepository(User).findOne({username: userid});
        if (user === undefined || user.deleted === true) {
            return channel.send("Your profile does not exist or was already deleted").then((message) => {
                message.delete(10000);
            });
        }

        typeorm.getConnection().createQueryBuilder()
                .update(User).set({deleted: true, notifications: false})
                .where("username = :username", {username: userid})
                .execute();
        channel.send("Your profile has been deleted").then((message) => {
            message.delete(10000);
        });

        const discordsender = this.bot.users.get(userid);

        const mutuals = await this.mutuals_entities(userid);
        for (const followUser of mutuals) {
            const discordrecipient = this.bot.users.get(followUser.username);
            followUser.discordname = discordrecipient.username;
            followUser.discriminator = discordrecipient.discriminator;
            entityManager.save(followUser);

            if (followUser.deleted === false && followUser.notifications) {
                discordrecipient.send(`Your mutual follower, <@${userid}> (${discordsender.username}) deleted their Mokyuu Profiles profile`);
            }
        }

        const following = await this.following_entities(userid);
        for (const followUser of following) {
            const discordrecipient = this.bot.users.get(followUser.username);
            followUser.discordname = discordrecipient.username;
            followUser.discriminator = discordrecipient.discriminator;
            entityManager.save(followUser);

            const mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
            if (followUser.deleted === false && followUser.notifications && !mutual_relationship) {
                discordrecipient.send(`Your follower, <@${userid}> (${discordsender.username}) deleted their Mokyuu Profiles profile`);
            }
        }

        const followers = await this.followers_entities(userid);
        for (const followUser of followers) {
            const discordrecipient = this.bot.users.get(followUser.username);
            followUser.discordname = discordrecipient.username;
            followUser.discriminator = discordrecipient.discriminator;
            entityManager.save(followUser);

            const mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
            if (followUser.deleted === false && followUser.notifications && !mutual_relationship) {
                discordrecipient.send(`<@${userid}> (${discordsender.username}), who you follow, deleted their Mokyuu Profiles profile`);
            }
        }
    }

    async list(channel, page) {
        const itemsPerPage = 3;
        if (page < 1) { page = 1; }
        if (this.msg_if_restricted_channel(channel)) { return; }
        const users = await entityManager.createQueryBuilder(User, "user")
            .innerJoinAndMapOne("user.gameInfo", MagiRecoUser, "gameUser", "gameUser.friend_id = user.friend_id")
            .where("user.deleted = :value", {value: false})
            .orderBy("gameUser.user_rank", "DESC")
            .take(itemsPerPage)
            .skip((page - 1) * itemsPerPage)
            .getMany();
        let messageTxt = `**All Profiles (Page ${page}):**`;
        for (const user of users) {
            const userTxt = "\n★  " + await this.build_check_message("", user.friend_id, user);

            messageTxt += userTxt;
        }
        const message = await channel.send(messageTxt);
        for (const user of users) {
            messageTxt = messageTxt.replace(`${user.discordname}#${user.discriminator}`, `<@${user.username}>`);
        }
        await message.edit("");
        await message.edit(messageTxt);
    }

    all() {
        // this.db.run("select * from test"); // userid lookup?
    }

    other() {
        // let db = new sqlite3.Database(`./data/test.db`);
        // //db.run("CREATE TABLE IF NOT EXISTS test (userid TEXT, profileid TEXT, notifications INTEGER)")
        // const [user_one, user_two] = ["Ranigad", "Bracket"];
        // //db.run("DELETE FROM test WHERE userid=?", [user_two])
        // //db.run("INSERT INTO test (userid, profileid, notifications) VALUES (?, ?, ?)", [user_two, "Aoba", 1]);
        // db.all("SELECT profileid FROM test WHERE userid=?", [user_one], (err, results) => {
        //     Logger.log(results);
        // });

        // db.all("SELECT profileid, notifications FROM test WHERE userid=?", [user_two], (err, results) => {
        //     Logger.log(results);
        // });
        // //Logger.log(message.mentions.members.first().id);
    }
}
