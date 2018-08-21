"use strict";

const BaseCommand = require('../BaseCommand.js');
const sqlite3 = require('sqlite3').verbose();
const typeorm = require('typeorm');
const User = require('../model/User').User;
const entityManager = typeorm.getManager();

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
        if (subcommand) {
            // check mention - subcommand becomes request? or check. Pass in mentioned user, check it's not self
            // check subcommand
            let [command, user, channel, value, value2] = [subcommand.toLowerCase(), message.author, message.channel, etc, etc2 || 0];

            if (etc && etc.isPing) {
                user = value; // User object of mention
            }

            this.run(command, user, channel, value, value2);

        } else {
            this.run("check", message.author, message.channel, undefined);
            console.log("check");
            // do a self profile check
        }

        //this.run();
    }



    run(subcommand, user, channel, value, value2) {
        switch(subcommand) {
            case 'create':  // --
                console.log("create");
                if (value) {
                    this.create(channel, user, value)
                }
                else {
                    channel.send(`Error: You need to provide your friend ID`).then(message => {
                        message.delete(5000);
                    });
                }
                break;
            case 'set': // set with target as userid
            case 'change':
                console.log("set");
                if (value) {
                    this.set(channel, user, "profile", value);
                }
                else {
                    channel.send(`Error: You need to provide your friend ID`).then(message => {
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
                    channel.send("Error: Please use ;profile notify on or ;profile notify off").then(message => {
                        message.delete(10000);
                    });
                }
                break;
            case 'profile':
            case 'check':
            case 'actual mention': // check someone else, also is check command
                console.log("mention");
                var guild = channel.guild;
                var userid = undefined;
                if (value) {
                    console.log(value);
                    var regex1 = /<@\d+>/;
                    var regex2 = /\d+/;
                    if (regex1.test(value)) {
                        userid = value.replace("<", "");
                        userid = userid.replace("@", "");
                        userid = userid.replace(">", "");
                    }
                    else {
                        var words = value.split("#");
                        if (words.length == 2) {
                            let [name, discriminator] = [words[0]];
                            var guild_member = guild.members.find(member => member.user.username == name && member.user.discriminator);
                            if (guild_member == undefined) {
                                // Not Found
                            }
                            userid = guild_member.user.id;
                        }
                        else if (regex2.test(value)) {
                            userid = value;
                        }
                        else {
                            // Error - not ping, name&discriminator, or ID
                        }
                    }
                }
                if (userid == undefined) {
                    console.log("Undefined ID");
                    userid = user.id;
                }
                this.check(channel, userid);
                break;
            case 'request': // check with request
                console.log("request");
                this.check(channel, user, true);
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

    create(channel, discorduser, profile) {
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
        var user = entityManager.getRepository(User).findOne({username: userid}).then(user => {
            if (user == undefined || user.deleted == true) {
                if (target === "profile") {
                    return this.create(channel, discorduser, value);
                }
                else {
                    return channel.send("Your profile was deleted or does not exist.  Use ;profile create <friend-ID>").then(message => {
                        message.delete(10000);
                    });
                }
            }
            // Check which is being changed, then change:
            if (target === "profile") {
                typeorm.getConnection().createQueryBuilder()
                    .update(User).set({friend_id: value})
                    .where("username = :username", {username: userid})
                    .execute();
                channel.send("Your friend ID has been updated").then(message => {
                    message.delete(10000);
                });
            } else if (target === "notifications") {
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

    check(channel, userid, request=false) {
        entityManager.getRepository(User).findOne({username: userid}).then(user => {
            if (user == undefined) {
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
