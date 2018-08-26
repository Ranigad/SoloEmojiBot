const EntitySchema = require("typeorm").EntitySchema;
const Friend = require("../model/Friend").Friend;

module.exports = new EntitySchema({
    name: "Friend",
    target: Friend,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        user_a: {
            type: "varchar"
        },
        user_a: {
            type: "varchar"
        },
        friends: {
            default: false,
            type: "boolean"
        }
    }
});
