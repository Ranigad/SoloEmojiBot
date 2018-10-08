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
            type: "varchar"
        },
        friend_id : {
            type: "varchar"
        },
        notifications: {
            default: false,
            type: "boolean"
        },
        addtimestamp: {
            type: "datetime"
        },
        deleted: {
            type: "boolean",
            default: false
        }
    }
});
