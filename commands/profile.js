"use strict";

const BaseCommand = require('../BaseCommand.js');
const sqlite3 = require('sqlite3').verbose();
const typeorm = require('typeorm');
const User = require('../model/User').User;
const Friend = require('../model/Friend').Friend;
const entityManager = typeorm.getManager();
const Util = require('../Util.js');
const MagiRecoUser = require('../model/MagiRecoUser').MagiRecoUser;
const MasterMeguca = require('../model/MasterMeguca').MasterMeguca;
const Meguca = require('../model/Meguca').Meguca;
const MasterMemoria = require('../model/MasterMemoria').MasterMemoria;
const Memoria = require('../model/Memoria').Memoria;
const translationHandler = require("../TranslationHandler.js");


const production_server = process.env.PROD_SERVER;

module.exports = class Profile extends BaseCommand {
    constructor(debug=false) {
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
        let [wiki, bot, message, [subcommand, etc, etc2]] = args;
        this.bot = bot;
        if (subcommand) {
            // check mention - subcommand becomes request? or check. Pass in mentioned user, check it's not self
            // check subcommand
            let [command, user, channel, value, value2] = [subcommand.toLowerCase(), message.author, message.channel, etc, etc2 || 0];

            this.run(command, user, channel, value, value2);
        } else {
            this.run("check", message.author, message.channel, undefined);
            console.log("check");
            // do a self profile check
        }
    }



    run(subcommand, user, channel, value, value2) {
        switch(subcommand) {
            case 'recreate':
            case 'create':  // --
                console.log("create");
                if (value && value2) {
                    this.create(channel, user, value, value2)
                }
                else {
                    channel.send(`Error: You need to provide your friend ID and display name`).then(message => {
                        message.delete(5000);
                    });
                }
                break;
            case 'set': // set with target as userid
            case 'change':
                console.log("set");
                console.log(value);
                var settings = ["id", "name"];
                if (value && settings.includes(value)) {
                    if (value2) {
                        this.set(channel, user.id, value, value2);
                    }
                    else {
                        channel.send(`Error: You need to provide your ${value}`).then(message => {
                            message.delete(5000);
                        });
                    }
                }
                else {
                    channel.send(`Error: You need to set either an id or a name, e.g. ;profile ${subcommand} id Q69KBCAA`).then(message => {
                        message.delete(5000);
                    });
                }
                break;
            case 'mentions':
            case 'notifications':
            case 'notify':    // turn on off notifications use set but with notification as target
                console.log("notifications");
                let valuemap = {"on": true, "off": false}
                if (value in valuemap) {
                    this.set(channel, user.id, "notifications", valuemap[value]);
                }
                else {
                    channel.send(`Error: Please use ;profile ${subcommand} on or ;profile ${subcommand} off`).then(message => {
                        message.delete(10000);
                    });
                }
                break;
            case 'profile':
            case 'check':
                console.log("mention");
                var userid = undefined;
                var selfcheck = false;
                if (value) {
                    userid = new Util().get_user_id_or_error(value, channel);
                    if (userid == undefined) return;
                }
                if (userid == undefined) {
                    userid = user.id;
                    selfcheck = true;
                }
                this.check(channel, userid, selfcheck);
                break;
            case 'supports':
                console.log("supports");
                var userid = undefined;
                var selfcheck = false;
                if (value) {
                    userid = new Util().get_user_id_or_error(value, channel);
                    if (userid == undefined) return;
                }
                if (userid == undefined) {
                    userid = user.id;
                    selfcheck = true;
                }
                this.supports(channel, userid, selfcheck);
                break;
            case 'follow':
                console.log("follow");
                if (value) {
                    var userid = new Util().get_user_id_or_error(value, channel);
                    if (userid == undefined) {
                        return;
                    }
                    this.follow(channel, user.id, userid);
                }
                else {
                    channel.send("Error: Please mention a user to friend, using a ping, name#discriminator, or ID").then(message => {
                        message.delete(5000);
                    });
                }
                break;
            case 'following':
                console.log("following");
                this.following(channel, user.id);
                break;
            case 'followers':
                console.log("followers");
                this.followers(channel, user.id);
                break;
            case 'mutuals':
                console.log("friends");
                this.mutuals(channel, user.id);
                break;
            case 'unfollow':
                console.log("unfollow");
                if (value) {
                    var userid = new Util().get_user_id_or_error(value, channel);
                    if (userid == undefined) {
                        return;
                    }
                    this.unfollow(channel, user.id, userid);
                }
                else {
                    channel.send("Error: Please mention a user to unfollow, using a ping, name#discriminator, or ID").then(message => {
                        message.delete(5000);
                    });
                }
                break;
            case 'delete':
                this.delete(channel, user.id);
                break;
            case 'list':
                if (value) {
                    let page = parseInt(value);
                    console.log(page);
                    this.list(channel, page);
                }
                else this.list(channel, 1);
                break;
            case 'exporttranslations': 
                if (channel.guild.id != production_server) {
                    translationHandler.export_data(channel);
                    break;
                }
            default:
                var userid = undefined;
                var selfcheck = false;
                if (subcommand) {
                    var userdata = new Util().get_user_id_mention(subcommand, channel.guild);
                    if (userdata.success == true) {
                        userid = userdata.userid;
                        this.check(channel, userid, selfcheck);
                    }
                    else {
                        if (userdata.reason == 0) {
                            return channel.send("The given user could not be found.  They may not be in the server now").then(message => {
                                message.delete(10000);
                            });
                        }
                        else {
                            console.log("Error happened");
                            return channel.send(`There was an error with your command: ";profile ${subcommand}".  Use ;profile help for supported commands`).then(message => {
                                message.delete(10000);
                            });
                        }
                    }
                }
                if (userid == undefined) {
                    userid = user.id;
                    selfcheck = true;
                    this.check(channel, userid, selfcheck);
                }
        }

    }

    async is_mutual(user_a, user_b) {
        var friend = await this.check_friends(user_a, user_b);
        if (friend.a_follows == true && friend.b_follows == true) return true;
        else return false;
    }

    async does_follow(follower, followee) {
        var friend = await this.check_friends(follower, followee);
        if (friend.user_a == follower && friend.a_follows == true) return true;
        else if (friend.user_b == follower && friend.b_follows == true) return true;
        else return false;
    }

    async create(channel, discorduser, profile, displayname) {
        // Create new profile, then send message and check if notifications want to be turned on
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: discorduser.id});
        var userid = discorduser.id;
        var mode = undefined;
        var recreated = false;

        if (user != undefined && user.deleted == false) {
            console.log("User already exists - updating");
            mode = "updated";
        }
        else if (user != undefined) {
            console.log("Restoring user");
            user.deleted = false;
            user.notifications = false;
            mode = "created";
            recreated = true;
        }
        else {
            console.log("Creating new user");
            user = new User();
            user.addtimestamp = new Date().toUTCString();
            mode = "created";
        }

        user.username = discorduser.id;
        user.discordname = discorduser.username;
        user.discriminator = discorduser.discriminator;
        user.friend_id = profile;
        user.displayname = displayname;

        await entityManager.save(user);

        channel.send(`Your profile has been ${mode}`).then(async message => {

            let gameUser = await entityManager.getRepository(MagiRecoUser)
                .findOne({where: {friend_id: user.friend_id}});
            if (gameUser == undefined) {
                let request = {inviteCode: user.friend_id, id: undefined, callback: this.handle_retrieved_new_account,
                    message: message, initialmessage: "", user: user, bmfun: undefined}
                    console.log(user);
                this.bot.supportsManager.fetchUserWithInvite(request);
            }

            if (mode == "created") {
                channel.send(`Reply ;profile notify on to enable notifications from other players`).then(message => {
                });
            }
            else {
                message.delete(10000);
            }
        });

        if (recreated) {
            const discordsender = this.bot.users.get(userid);

            var mutuals = await this.mutuals_entities(userid);
            for (var user of mutuals) {
                const discordrecipient = this.bot.users.get(user.username);
                user.discordname = discordrecipient.username;
                user.discriminator = discordrecipient.discriminator;
                entityManager.save(user);

                if (user.deleted == false && user.notifications) {
                    discordrecipient.send(`Your former mutual follower, ${discordsender.discordname}#${discordsender.discriminator} recreated their profile`).then(message => {
                        message.edit(`Your former mutual follower, <@${userid}> recreated their profile`);
                    });
                }
            }

            var following = await this.following_entities(userid);
            for (var user of following) {
                const discordrecipient = this.bot.users.get(user.username);
                user.discordname = discordrecipient.username;
                user.discriminator = discordrecipient.discriminator;
                entityManager.save(user);
    
                var mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
                if (user.deleted == false && user.notifications && !mutual_relationship) {
                        discordrecipient.send(`Your former follower, ${discordsender.discordname}#${discordsender.discriminator} recreated their profile`).then(message => {
                        message.edit(`Your former follower, <@${userid}> recreated their profile`);
                    });
                }
            }

            var followers = await this.followers_entities(userid);
            for (var user of followers) {
                const discordrecipient = this.bot.users.get(user.username);
                user.discordname = discordrecipient.username;
                user.discriminator = discordrecipient.discriminator;
                entityManager.save(user);
    
                var mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
                if (user.deleted == false && user.notifications && !mutual_relationship) {
                        discordrecipient.send(`${discordsender.discordname}#${discordsender.discriminator}, who you had followed, recreated their profile`).then(message => {
                        message.edit(`<@${userid}>, who you had followed, recreated their profile`);
                    });
                }
            }
        }
    }

    handle_retrieved_new_account(success, message, initialMessage, inviteCode, user, build_message) {
        let mention = `<@${user.username}>`;
        let channel = message.channel;
        if (success == false) {
            channel.send(`${mention}, your support data couldn't get fetched.  Please double check your friend id`);
        }
        else {
            channel.send(`${mention}, your support data was successfully fetched!  Use ;profile or ;profile supports to view your data`);
        }
    }

    error_if_no_profile(user, channel) {
        if (user == undefined || user.deleted == true) {
            channel.send("Your profile was deleted or does not exist.  Use ;profile create <friend-ID> <display-name>").then(message => {
                message.delete(10000);
            });
            return true;
        }
        return false;
    }

    msg_if_restricted_channel(channel) {
        if (channel != undefined && channel.guild != undefined && channel.guild.id == this.production_server
            && !channel.name.includes("bot")) {
                channel.send("You can only use this command in the #bot-commands chanel").then(message => {
                    message.delete(10000);
                });
                return true;
        }
        return false;
    }

    set(channel, userid, target, value) {
        if (this.msg_if_restricted_channel(channel)) return;
        entityManager.getRepository(User).findOne({username: userid}).then(user => {
            var error = this.error_if_no_profile(user, channel);
            if (error) return;
            // Check which is being changed, then change:
            if (target === "id") {
                typeorm.getConnection().createQueryBuilder()
                    .update(User).set({friend_id: value})
                    .where("username = :username", {username: userid})
                    .execute();
                channel.send("Your friend ID has been updated").then(message => {
                    message.delete(10000);
                });
            }
            else if (target === "name") {
                typeorm.getConnection().createQueryBuilder()
                    .update(User).set({displayname: value})
                    .where("username = :username", {username: userid})
                    .execute();
                channel.send("Your game display name has been updated").then(message => {
                    message.delete(10000);
                });
            }
            else if (target === "notifications") {
                typeorm.getConnection().createQueryBuilder()
                    .update(User).set({notifications: value})
                    .where("username = :username", {username: userid})
                    .execute();
                channel.send("Your notifications have been updated").then(message => {
                    message.delete(10000);
                });
            }
        });
    }

    async check(channel, userid, selfcheck) {
        var user = await entityManager.getRepository(User).findOne({username: userid});
        if (user == undefined || user.deleted == true) {
            if (selfcheck) {
                return channel.send("Your profile does not exist or was deleted.  Use ;profile create to create it").then(message => {
                    message.delete(5000);
                });
            }
            return channel.send("That user does not have a profile or their profile was deleted").then(message => {
                message.delete(5000);
            });
        }

        const discorduser = channel.guild.members.get(userid).user;
        user.discordname = discorduser.username;
        user.discriminator = discorduser.discriminator;

        entityManager.save(user);

        let initialMessageTxt = `${user.discordname}#${user.discriminator}: **Friend ID**: ${user.friend_id} **Display Name**: ${user.displayname}`;
        let messageTxt = initialMessageTxt;
        messageTxt = await this.build_check_message(messageTxt, user.friend_id, user);

        let userId = undefined;

        let gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: user.friend_id}, relations: ["meguca", "meguca.masterMeguca"]});

        if (gameUser != undefined && gameUser.user_id != undefined) userId = gameUser.user_id;

        let message = await channel.send(messageTxt);
        console.log(messageTxt);
        messageTxt = messageTxt.replace(`${user.discordname}#${user.discriminator}`, `<@${user.username}>`);
        await message.edit("");
        console.log(messageTxt);
        await message.edit(messageTxt);
        // Update data if necessary
        let timeNow = Date.now();
        let updateTime = Date.parse(gameUser.updatetimestamp);
        let hours = Math.abs(timeNow - updateTime) / 36e5;
        if (hours > 21) {
            messageTxt += " Updating... <a:mokyuuwork:494356712883617812>";
            await message.edit(messageTxt);
            var request = {inviteCode: user.friend_id, id: userId, callback: this.edit_sent_message,
                message: message, initialmessage: initialMessageTxt, user: user, bmfun: this.build_check_message}
            if (userId != undefined) {
                this.bot.supportsManager.fetchUserWithId(request);
            }
            else this.bot.supportsManager.fetchUserWithInvite(request);
        }
    }

    async edit_sent_message(success, message, initialMessage, inviteCode, user, build_message) {
        var messageTxt = await build_message(initialMessage, inviteCode, user);
        if (success == false) messageTxt += "   Update failed - an error occurred.";
        else messageTxt += "   The data was updated succesfully"
        await message.edit("");
        await message.edit(messageTxt);
    }

    async build_check_message(messageTxt, friendId, user) {
        var gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: friendId}, relations: ["meguca", "meguca.masterMeguca"]});
        
        if (gameUser != undefined) {
            messageTxt = `${user.discordname}#${user.discriminator}: **Friend ID**: ${user.friend_id} **Display Name**: ${gameUser.display_name} **Rank**: ${gameUser.user_rank}`;
            var girls = gameUser.meguca;
            
            if (girls != undefined && girls.length != 0) {
                girls.sort((a,b) => (a.support_type > b.support_type) ? 1 : ((b.support_type > a.support_type) ? -1 : 0));

                var attributes = ["<:att_void:494355788886704138>", "<:att_fire:494355788878315520>", "<:att_water:494355788681183233>", "<:att_timber:494355788916326401>", "<:att_light:494355788870057984>", "<:att_dark:494355788496764942>"];

                messageTxt += "\n";
                for (var i = 0; i < girls.length; i++) {
                    var attribute = girls[i].masterMeguca.meguca_type;
                    if (attribute > 0 && attribute < 7) messageTxt += `${attributes[attribute - 1]} `;
                    messageTxt += `**${(girls[i].masterMeguca.nick) ? girls[i].masterMeguca.nick : girls[i].masterMeguca.jpn_name}** `;
                    messageTxt += `・${girls[i].slots}s・Lv${girls[i].level}・${(girls[i].magia_level == 6) ? "Doppel" : "Magia" + girls[i].magia_level} `;
                }
            }

            messageTxt += `\nUpdated: ${gameUser.updatetimestamp}`; 
        }
        return messageTxt;
    }

    async supports(channel, userid, selfcheck) {
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: userid});
        if (user == undefined || user.deleted == true) {
            if (selfcheck) {
                return channel.send("Your profile does not exist or was deleted.  Use ;profile create to create it").then(message => {
                    message.delete(5000);
                });
            }
            return channel.send("That user does not have a profile or their profile was deleted").then(message => {
                message.delete(5000);
            });
        }

        const discorduser = channel.guild.members.get(userid).user;
        user.discordname = discorduser.username;
        user.discriminator = discorduser.discriminator;

        entityManager.save(user);

        let initialMessageTxt = `${user.discordname}#${user.discriminator}: **Friend ID**: ${user.friend_id} **Display Name**: ${user.displayname}`;
        let messageTxt = initialMessageTxt;
        messageTxt = await this.build_supports_message(messageTxt, user.friend_id, user);

        let userId = undefined;

        let gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: user.friend_id}, relations: ["meguca", "meguca.masterMeguca"]});

        if (gameUser != undefined && gameUser.user_id != undefined) userId = gameUser.user_id;
        else messageTxt += "\nNo support data exists for that player currently... ";

        let message = await channel.send(messageTxt);
        messageTxt = messageTxt.replace(`${user.discordname}#${user.discriminator}`, `<@${user.username}>`);
        await message.edit("");
        await message.edit(messageTxt);
        // Update data if necessary
        let timeNow = Date.now();
        let updateTime = Date.parse(gameUser.updatetimestamp);
        let hours = Math.abs(timeNow - updateTime) / 36e5;
        if (hours > 21) {
            messageTxt += " Updating... <a:mokyuuwork:494356712883617812>";
            await message.edit(messageTxt);
            var request = {inviteCode: user.friend_id, id: userId, callback: this.edit_sent_message,
                message: message, initialmessage: initialMessageTxt, user: user, bmfun: this.build_supports_message}
            if (userId != undefined) {
                this.bot.supportsManager.fetchUserWithId(request);
            }
            else this.bot.supportsManager.fetchUserWithInvite(request);
        }
    }

    async build_supports_message(messageTxt, friendId, user) {
        var gameUser = await entityManager.getRepository(MagiRecoUser)
            .findOne({where: {friend_id: friendId}, relations: ["meguca", "meguca.masterMeguca", "meguca.memes", "meguca.memes.masterMemoria"]});

        if (gameUser != undefined) {
            messageTxt = `${user.discordname}#${user.discriminator}: **Friend ID**: ${user.friend_id} **Display Name**: ${gameUser.display_name} **Rank**: ${gameUser.user_rank}`;
            var girls = gameUser.meguca;
            
            if (girls != undefined && girls.length != 0) {
                girls.sort((a,b) => (a.support_type > b.support_type) ? 1 : ((b.support_type > a.support_type) ? -1 : 0));

                var attributes = ["<:att_void:494355788886704138>", "<:att_fire:494355788878315520>", "<:att_water:494355788681183233>", "<:att_timber:494355788916326401>", "<:att_light:494355788870057984>", "<:att_dark:494355788496764942>"];

                for (var i = 0; i < girls.length; i++) {
                    messageTxt += "\n";
                    var attribute = girls[i].masterMeguca.meguca_type;
                    if (attribute > 0 && attribute < 7) messageTxt += `${attributes[attribute - 1]} `;
                    messageTxt += `**${(girls[i].masterMeguca.eng_sur && girls[i].masterMeguca.eng_given) ? girls[i].masterMeguca.eng_sur + " " + girls[i].masterMeguca.eng_given : girls[i].masterMeguca.jpn_name}** `;
                    messageTxt += `・${girls[i].slots}s・Lv${girls[i].level}・${(girls[i].magia_level == 6) ? "Doppel" : "Magia" + girls[i].magia_level} `;
                    messageTxt += `\n${girls[i].hp} HP・${girls[i].attack} ATK・${girls[i].defense} DEF`;

                    for (var k = 0; k < girls[i].memes.length; k++) {
                        let meme = girls[i].memes[k];
                        let masterMeme = meme.masterMemoria;
                        let rating = masterMeme.rating;
                        let lbCount = meme.lbCount;
                        let level = meme.level;
                        let maxLevel = (rating == 4) ? 30 + 5 * lbCount : 5 + rating * 5 + 5 * lbCount;
                        let levelString = `${level}/${maxLevel}`;
                        levelString = (lbCount == 4) ? "**Lvl " + levelString + " (MLB)**" : "Lvl " + levelString;
                        let memeName = masterMeme.eng_name ? masterMeme.eng_name : masterMeme.jpn_name;
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
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: senderid});
        var error = this.error_if_no_profile(user, channel);
        if (error) return;

        if (senderid == recipientid) {
            return channel.send("You cannot follow yourself").then(message => {
                message.delete(5000);
            })
        }

        user = await entityManager.getRepository(User).findOne({username: recipientid});
        if (user == undefined || user.deleted == true) {
            return channel.send("That user does not have a profile or their profile was deleted").then(message => {
                message.delete(5000);
            });
        }

        const discordrecipient = this.bot.users.get(recipientid);
        user.discordname = discordrecipient.username;
        user.discriminator = discordrecipient.discriminator;
        entityManager.save(user);

        const discordsender = this.bot.users.get(senderid);

        var friend = await this.check_friends(senderid, recipientid);

        if (friend != undefined) {
            if (friend.a_follows == true && friend.b_follows == true) {
                return channel.send(`You are already following ${user.discordname}#${user.discriminator}`).then(message => {
                    message.edit(`You are already following <@${user.username}>`);
                });
            }

            if ((friend.user_a == senderid && friend.a_follows == true) || (friend.user_b == senderid && friend.b_follows == true)) {
                return channel.send(`You have already followed ${user.discordname}#${user.discriminator}`).then(message => {
                    message.edit(`You have already followed <@${user.username}>`);
                });
            }

            // If neither of these are true, then someone else sent them a friend request previously - accept friends
            if (friend.a_follows == true) friend.b_follows = true;
            else friend.a_follows = true;
            entityManager.save(friend);

            channel.send(`You are now mutually following ${user.discordname}#${user.discriminator}.  Make sure to follow them ingame`).then(message => {
                message.edit(`You are now mutually following <@${user.username}>.  Make sure to follow them ingame`);
            });

            if (user.deleted == false && user.notifications) {
                discordrecipient.send(`${discordsender.discordname}#${discordsender.discriminator} followed you back!  Make sure to follow them ingame`).then(message => {
                    message.edit(`<@${senderid}> followed you back!  Make sure to follow them ingame`)
                });
            }
            return;
        }

        // A friend relation does not already exist --> create one:
        var friend = new Friend();
        friend.user_a = senderid;
        friend.user_b = recipientid;
        friend.a_follows = true;
        console.log(friend);
        entityManager.save(friend);

        if (user.notifications) {
            discordrecipient.send(`You have been followed by ${discordsender.discordname}#${discordsender.discriminator}!  Use ;profile friend to accept or ;profile check to view their info`).then(message => {
                message.edit(`You have been followed by <@${senderid}>!  Use ;profile follow to follow back or ;profile check to view their info`)
            });

            return channel.send(`You have followed ${user.discordname}#${user.discriminator}!`).then(message => {
                message.edit(`You have followed <@${user.username}>!`);
            });
        }

        return channel.send(`You have followed ${user.discordname}#${user.discriminator}.  Please note, they do not have notifications on.`).then(message => {
            message.edit(`You have followed <@${user.username}>.  Please note, they do not have notifications on.`);
        });
    }

    // Get follow/friend relationship
    async check_friends(user1, user2) {
        var friend = await entityManager.getRepository(Friend).findOne({user_a: user1, user_b: user2});
        if (friend != undefined) {
            return friend;
        }

        friend = await entityManager.getRepository(Friend).findOne({user_b: user1, user_a: user2});
        return friend;
    }

    async mutuals_entities(userid) {
        var friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("friend.user_b")
                    .from(Friend, "friend")
                    .where("friend.user_a = :username", {username: userid})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .andWhere("friend.b_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .orWhere(qb => {
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
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: senderid});
        var error = this.error_if_no_profile(user, channel);
        if (error) return;

        var friends = await this.mutuals_entities(senderid);

        if (friends.length == 0) {
            return channel.send("You currently do not have any mutual follows.  Use ;profile follow to follow players").then(message => {
                message.delete(5000);
            });
        }

        var initialmessage = "**Your Mutual Follows**:";
        var finalmessage = initialmessage;
        var count = 0;

        for (var i = 0; i < friends.length; i++) {
            if (friends[i].deleted == true) continue;
            initialmessage += `\n★ ❤️ ${friends[i].discordname}#${friends[i].discriminator}: ${friends[i].friend_id} (${friends[i].displayname})`;
            finalmessage += `\n★ ❤️ <@${friends[i].username}>: ${friends[i].friend_id} (${friends[i].displayname})`;
            count++;
        }

        if (count == 0) {
            return channel.send("You currently do not have any mutual follows.  Use ;profile follow to follow players").then(message => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then(message => {
            message.edit(finalmessage).then(message => {
                message.delete(50000);
            });
        });
    }

    async followers_entities(userid) {
        var friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("friend.user_b")
                    .from(Friend, "friend")
                    .where("friend.user_a = :username", {username: userid})
                    .andWhere("friend.b_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .orWhere(qb => {
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
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: senderid});
        var error = this.error_if_no_profile(user, channel);
        if (error) return;

        var friends = await this.followers_entities(senderid);

        if (friends.length == 0) {
            return channel.send("You currently do not have any followers").then(message => {
                message.delete(5000);
            });
        }

        var initialmessage = "**Your Followers**:";
        var finalmessage = initialmessage;
        var count = 0;

        for (var i = 0; i < friends.length; i++) {
            if (friends[i].deleted == true) continue;
            var friendship = await this.check_friends(senderid, friends[i].username);
            initialmessage += "\n★ ";
            finalmessage += "\n★ ";
            if (friendship != undefined && friendship.a_follows == true && friendship.b_follows == true) {
                initialmessage += "❤️ ";
                finalmessage += "❤️ ";
            }
            initialmessage += `${friends[i].discordname}#${friends[i].discriminator}: ${friends[i].friend_id} (${friends[i].displayname})`;
            finalmessage += `<@${friends[i].username}>: ${friends[i].friend_id} (${friends[i].displayname})`;
            count++;
        }

        if (count == 0) {
            return channel.send("You currently do not have any followers").then(message => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then(message => {
            message.edit(finalmessage).then(message => {
                message.delete(50000);
            });
        });
    }

    async following_entities(userid) {
        var friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select("friend.user_b")
                    .from(Friend, "friend")
                    .where("friend.user_a = :username", {username: userid})
                    .andWhere("friend.a_follows = :value", {value: true})
                    .getQuery();
                return "user.username IN " + subQuery;
            })
            .orWhere(qb => {
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
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: senderid});
        var error = this.error_if_no_profile(user, channel);
        if (error) return;

        var friends = await this.following_entities(senderid);

        if (friends.length == 0) {
            return channel.send("You currently do not follow anyone.  Use ;profile follow to follow players").then(message => {
                message.delete(5000);
            });
        }

        var initialmessage = "**Following**:";
        var finalmessage = initialmessage;
        var count = 0;

        for (var i = 0; i < friends.length; i++) {
            if (friends[i].deleted == true) continue;
            var friendship = await this.check_friends(senderid, friends[i].username);
            initialmessage += "\n★ ";
            finalmessage += "\n★ ";
            if (friendship && friendship.a_follows == true && friendship.b_follows == true) {
                initialmessage += "❤️ ";
                finalmessage += "❤️ ";
            }
            initialmessage += `${friends[i].discordname}#${friends[i].discriminator}: ${friends[i].friend_id} (${friends[i].displayname})`;
            finalmessage += `<@${friends[i].username}>: ${friends[i].friend_id} (${friends[i].displayname})`;
            count++;
        }

        if (count == 0) {
            return channel.send("You currently do not follow anyone.  Use ;profile follow to follow players").then(message => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then(message => {
            message.edit(finalmessage).then(message => {
                message.delete(50000);
            });
        });
    }

    /** @deprecated */
    async requests(channel, senderid) {
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: senderid});
        var error = this.error_if_no_profile(user, channel);
        if (error) return;

        var friends = await entityManager.getRepository(User)
            .createQueryBuilder("user")
            .where(qb => {
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

        if (friends.length == 0) {
            return channel.send("You currently do not have any non-mutual follows").then(message => {
                message.delete(5000);
            });
        }

        var initialmessage = "**Non-Mutual Follows**:";
        var finalmessage = initialmessage;
        var count = 0;

        for (var i = 0; i < friends.length; i++) {
            if (friends[i].deleted == true) continue;
            initialmessage += `\n★ ${friends[i].discordname}#${friends[i].discriminator}: ${friends[i].friend_id} (${friends[i].displayname})`;
            finalmessage += `\n★ <@${friends[i].username}>: ${friends[i].friend_id} (${friends[i].displayname})`;
            count++;
        }

        if (count == 0) {
            return channel.send("You currently do not have any non-mutual follows").then(message => {
                message.delete(5000);
            });
        }

        return channel.send(initialmessage).then(message => {
            message.edit(finalmessage).then(message => {
                message.delete(50000);
            });
        });
    }


    async unfollow(channel, senderid, userid) {
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: senderid});
        var error = this.error_if_no_profile(user, channel);
        if (error) return;

        user = await entityManager.getRepository(User).findOne({username: userid});
        if (user == undefined || user.deleted == true) {
            return channel.send("That user does not have a profile or their profile was deleted").then(message => {
                message.delete(5000);
            });
        }
        var bot_user = user;

        var user = this.bot.users.get(userid);
        var sender = this.bot.users.get(senderid);

        var friend = await this.check_friends(senderid, userid);
        if (friend == undefined || (friend.a_follows == false && friend.user_a == senderid) || (friend.user_b == senderid && friend.b_follows == false)) {
            return channel.send(`You are not following ${user.username}#${user.discriminator}`).then(message => {
                message.edit(`You are not following <@${userid}>`).then(message => {
                    message.delete(5000);
                });
            });
        }

        if (friend.user_a == senderid) {
            friend.a_follows = false;
        }
        else friend.b_follows = false;

        if (friend.a_follows == false && friend.b_follows == false) {
            entityManager.remove(friend);
        }
        else {
            entityManager.save(friend);
        }

        channel.send(`You are no longer following  ${user.username}#${user.discriminator}`).then(message => {
            message.edit(`You are no longer following <@${userid}>`).then(message => {
                message.delete(5000);
            });
        });

        if (bot_user.deleted == false && bot_user.notifications) {
            user.send(`${sender.username}#${sender.discriminator} has unfollowed you`).then(message => {
                message.edit(`<@${senderid}> has unfollowed you`);
            });
        }
    }

    async delete(channel, userid) {
        if (this.msg_if_restricted_channel(channel)) return;
        var user = await entityManager.getRepository(User).findOne({username: userid});
        if (user == undefined || user.deleted == true) {
            return channel.send("Your profile does not exist or was already deleted").then(message => {
                message.delete(10000);
            });
        }

        typeorm.getConnection().createQueryBuilder()
                .update(User).set({deleted: true, notifications: false})
                .where("username = :username", {username: userid})
                .execute();
        channel.send("Your profile has been deleted").then(message => {
            message.delete(10000);
        });

        const discordsender = this.bot.users.get(userid);

        var mutuals = await this.mutuals_entities(userid);
        for (var user of mutuals) {
            const discordrecipient = this.bot.users.get(user.username);
            user.discordname = discordrecipient.username;
            user.discriminator = discordrecipient.discriminator;
            entityManager.save(user);

            if (user.deleted == false && user.notifications) {
                discordrecipient.send(`Your mutual follower, ${discordsender.discordname}#${discordsender.discriminator} deleted their profile`).then(message => {
                    message.edit(`Your mutual follower, <@${userid}> deleted their profile`);
                });
            }
        }

        var following = await this.following_entities(userid);
        for (var user of following) {
            const discordrecipient = this.bot.users.get(user.username);
            user.discordname = discordrecipient.username;
            user.discriminator = discordrecipient.discriminator;
            entityManager.save(user);

            var mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
            if (user.deleted == false && user.notifications && !mutual_relationship) {
                discordrecipient.send(`Your follower, ${discordsender.discordname}#${discordsender.discriminator} deleted their profile`).then(message => {
                    message.edit(`Your follower, <@${userid}> deleted their profile`);
                });
            }
        }

        var followers = await this.followers_entities(userid);
        for (var user of followers) {
            const discordrecipient = this.bot.users.get(user.username);
            user.discordname = discordrecipient.username;
            user.discriminator = discordrecipient.discriminator;
            entityManager.save(user);

            var mutual_relationship = await this.is_mutual(discordsender.id, discordrecipient.id);
            if (user.deleted == false && user.notifications && !mutual_relationship) {
                discordrecipient.send(`${discordsender.discordname}#${discordsender.discriminator}, who you follow, deleted their profile`).then(message => {
                    message.edit(`<@${userid}>, who you follow, deleted their profile`);
                });
            }
        }
    }

    async list(channel, page) {
        if (page < 1) page = 1;
        if (this.msg_if_restricted_channel(channel)) return;
        const users = await entityManager.createQueryBuilder(User, "user")
            .innerJoinAndMapOne("user.gameInfo", MagiRecoUser, "gameUser", "gameUser.friend_id = user.friend_id")
            .orderBy("gameUser.user_rank", "DESC")
            .take(10)
            .skip((page - 1) * 10)
            .getMany();
        let messageTxt = `**All Profiles (Page ${page}):**`;
        for (var user of users) {
            let userTxt = "\n★  " + await this.build_check_message("", user.friend_id, user);

            messageTxt += userTxt;
        }
        let message = await channel.send(messageTxt);
        for (var user of users) {
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
        //     console.log(results);
        // });

        // db.all("SELECT profileid, notifications FROM test WHERE userid=?", [user_two], (err, results) => {
        //     console.log(results);
        // });
        // //console.log(message.mentions.members.first().id);
    }
}
