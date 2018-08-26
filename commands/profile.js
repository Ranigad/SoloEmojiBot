"use strict";

const BaseCommand = require('../BaseCommand.js');
const sqlite3 = require('sqlite3').verbose();
const typeorm = require('typeorm');
const User = require('../model/User').User;
const Friend = require('../model/Friend').Friend;
const entityManager = typeorm.getManager();
const Util = require('../Util.js');

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
                        this.set(channel, user, value, value2);
                    }
                    else {
                        channel.send(`Error: You need to provide your ${value}`).then(message => {
                            message.delete(5000);
                        });
                    }
                }
                else {
                    channel.send(`Command Error: You need to set either an id or a name, e.g. ;profile set id Q69KBCAA`).then(message => {
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
                    this.set(channel, user, "notifications", valuemap[value]);
                }
                else {
                    channel.send("Error: Please use ;profile notify on or ;profile notify off").then(message => {
                        message.delete(10000);
                    });
                }
                break;
            case 'profile':
            case 'check':
            case 'actual mention': // check someone else, also is check command
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
            case 'friend':
            case 'request':
                console.log("request");
                if (value) {
                    var userid = new Util().get_user_id_or_error(value, channel);
                    if (userid == undefined) {
                        return;
                    }
                    this.friend(channel, user.id, userid);
                }
                else {
                    channel.send("Error: Please mention a user to friend, using a ping, name#discriminator, or ID").then(message => {
                        message.delete(5000);
                    });
                }
                break;
            case 'remove':
            case 'delete':  // remove
                console.log("break");
                // this.remove(channel, user.id);
                break;
            case 'reset':
                this.reset(channel, user.id);
                break;
            default:
                console.log("error message");
        }

    }

    create(channel, discorduser, profile, displayname) {
        // Create new profile, then send message and check if notifications want to be turned on
        entityManager.getRepository(User).findOne({username: discorduser.id}).then(user => {
            var mode = undefined;

            if (user != undefined && user.deleted == false) {
                console.log("User already exists - updating");
                user.notifications = false;
                mode = "updated";
            }
            else if (user != undefined) {
                console.log("Restoring user");
                user.deleted = false;
                mode = "created";
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

            entityManager.save(user);

            channel.send(`Your profile has been ${mode}`).then(message => {
                if (mode == "created") {
                    channel.send(`Reply ;profile notify on to enable notifications from other players`).then(message => {
                    });
                }
                else {
                    message.delete(10000);
                }
            });
        });
    }

    set(channel, discorduser, target, value) {
        var userid = discorduser.id;
        entityManager.getRepository(User).findOne({username: userid}).then(user => {
            if (user == undefined || user.deleted == true) {
                return channel.send("Your profile was deleted or does not exist.  Use ;profile create <friend-ID> <display-name>").then(message => {
                    message.delete(10000);
                });
            }
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

    check(channel, userid, selfcheck) {
        entityManager.getRepository(User).findOne({username: userid}).then(user => {
            if (user == undefined) {
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

            channel.send(`${user.discordname}#${user.discriminator}: Friend ID: ${user.friend_id}, Display Name: ${user.displayname}`).then(message => {
                message.edit(`<@${user.username}>: Friend ID: ${user.friend_id}, Display Name: ${user.displayname}`);
            });
        });
    }

    async friend(channel, senderid, recipientid) {
        var user = await entityManager.getRepository(User).findOne({username: recipientid});
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
            if (friend.friends == true) {
                return channel.send(`You are already friends with ${user.discordname}#${user.discriminator}`).then(message => {
                    message.edit(`You are already friends with <@${user.username}>`);
                });
            }

            if (friend.user_a == senderid) {
                return channel.send(`You have already sent a friend request to ${user.discordname}#${user.discriminator}`).then(message => {
                    message.edit(`You have already sent a friend request to <@${user.username}>`);
                });
            }

            // If neither of these are true, then someone else sent them a friend request previously - accept friends
            friend.friends = true;
            entityManager.save(friend);

            channel.send(`You are now friends with ${user.discordname}#${user.discriminator}.  Make sure to follow them ingame`).then(message => {
                message.edit(`You are now friends with <@${user.username}>.  Make sure to follow them ingame`);
            });

            if (user.notifications) {
                discordrecipient.send(`${discordsender.discordname}#${discordsender.discriminator} accepted your friend request, you are now friends!  Make sure to follow them ingame`).then(message => {
                    message.edit(`<@${senderid}> accepted your friend request, you are now friends!  Make sure to follow them ingame`)
                });
            }
            return;
        }

        // A friend relation does not already exist --> create one:
        var friend = new Friend();
        friend.user_a = senderid;
        friend.user_b = recipientid;
        console.log(friend);
        entityManager.save(friend);

        if (user.notifications) {
            var sender = this.bot.users.get(senderid);
            discordrecipient.send(`You have received a friend request from ${discordsender.discordname}#${discordsender.discriminator}!  Use ;profile friend to accept or ;profile check to view their info`).then(message => {
                message.edit(`You have received a friend request from <@${senderid}>!  Use ;profile friend to accept or ;profile check to view their info`)
            })

            return channel.send(`You have sent a friend request to ${user.discordname}#${user.discriminator}!`).then(message => {
                message.edit(`You have sent a friend request to <@${user.username}>!`);
            });
        }

        return channel.send(`You have sent a friend request to ${user.discordname}#${user.discriminator}.  Please note, they do not have notifications on.`).then(message => {
            message.edit(`You have sent a friend request to <@${user.username}>.  Please note, they do not have notifications on.`);
        });

        channel.send(`${user.discordname}#${user.discriminator}: Friend ID: ${user.friend_id}, Display Name: ${user.displayname}`).then(message => {
            message.edit(`<@${user.username}>: Friend ID: ${user.friend_id}, Display Name: ${user.displayname}`);
        });
    }

    async check_friends(user1, user2) {
        var friend = await entityManager.getRepository(Friend).findOne({user_a: user1, user_b: user2});
        if (friend != undefined) {
            return friend;
        }

        friend = await entityManager.getRepository(Friend).findOne({user_b: user1, user_a: user2});
        return friend;
    }


    remove(channel, userid) {
        //TODO
    }

    reset(channel, userid) {
        typeorm.getConnection().createQueryBuilder()
                .update(User).set({deleted: true})
                .where("username = :username", {username: userid})
                .execute();
        channel.send("Your profile has been deleted").then(message => {
            message.delete(10000);
        });
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
