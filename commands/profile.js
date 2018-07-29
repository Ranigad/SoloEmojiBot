"use strict";

const BaseCommand = require('../BaseCommand.js');
const sqlite3 = require('sqlite3').verbose();
const typeorm = require('typeorm');
const User = require('../entity/User');
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
        let [wiki, bot, message, [subcommand, etc]] = args;
        if (subcommand) {
            // check mention - subcommand becomes request? or check. Pass in mentioned user, check it's not self
            // check subcommand
            let [command, user, channel, value] = [subcommand.toLowerCase(), message.author, message.channel, etc || 0];

            if (etc.isPing) {
                user = value; // User object of mention
            }

            this.run(command, user, channel, value);

        } else {
            this.run("check", message.author, message.channel, undefined);
            console.log("check");
            // do a self profile check
        }

        //this.run();
    }

    run(subcommand, user, channel, value) {
        switch(subcommand) {
            case 'create':  // --
                console.log("create");
                if (value) {
                    this.create(channel, user, value)
                }
                break;
            case 'set': // set with target as userid
            case 'change':
                console.log("set");
                if (value) {
                    this.set(channel, user.id, "profile", value);
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
            case 'check':
            case 'actual mention': // check someone else, also is check command
                console.log("mention");
                this.check(channel, user); // Double check
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
            default:
                console.log("error message");
        }

    }

    create(channel, discorduser, profile) {
        // Create new profile, then send message and check if notifications want to be turned on
        var user = entityManager.getRepository(User).findOne({username: discorduser.id});
        if (user != undefined) {
            console.log("User already exists.");
        }
        else {
            console.log("Creating new user");
            var user = new User();
            user.username = discorduser.id;
            user.name = discorduser.username;
            user.discriminator = discorduser.discriminator;
            user.friend_id = profile;

            entityManager.save(user);
        }

        // this.db.run("INSERT INTO test (userid, profileid, notifications) VALUES (?, ?, ?)",
        //     [userid, profile, 0], (err) => {
        //         // channel.send( message + await response);
        //             // if notification is yes, call this.set on notification and 1
        //         if (err) {
        //             console.log(`Error in insert ${err}`);
        //             // Send channel message about existing user + profile. If you want to change use other command
        //         } else {
        //             console.log(`${profile} added`);
        //         }
        //     });
    }

    set(channel, userid, target, value) {
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
    }

    check(channel, user, request=false) {
        // Given a userid, check their profile. If add request, then check notifications and send private message
        // else, just display profile message
        // this.db.get("SELECT profileid, notifications FROM test WHERE userid=?", [user.id], (err, results) => {
        //     // if add request, then send message to userid
        //     if (err) {
        //         // Message about error
        //         return
        //     } if (request) {
        //         if (results.notifications) {
        //             // user.send(); // Send pm to user
        //             console.log("Sent request")
        //         } else {
        //             // This person has requested not to be notified
        //         }
        //     }

        //     console.log(results);
        //     // Post message with profileid

        // });
    }

    remove(channel, userid) {
        // this.db.run("DELETE FROM test WHERE userid=?", [user.id], (err) => {
        //     console.log("Error in deleting user");
        // });
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