const EntitySchema = require("typeorm").EntitySchema;
const User = require("../model/User").User;

module.exports = new EntitySchema({
    name: "User",
    target: User,
    columns: {
        username: {
            primary: true,
            type: "varchar",
        },
        discordname: {
            type: "varchar"
        },
        discriminator: {
            type: "varchar"
        },
        displayname: {
            nullable: true,
            type: "boolean"
        },
        friend_id : {
            type: "varchar"
        },
        notifications: {
            default: false,
            type: "boolean"
        },
        addtimestamp: {
            type: "date"
        },
        deleted: {
            type: "boolean",
            default: false
        }
    }
});
