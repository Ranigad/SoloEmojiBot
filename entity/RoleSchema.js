const EntitySchema = require("typeorm").EntitySchema;
const Role = require("../model/Role").Role;

module.exports = new EntitySchema({
    name: "Role",
    target: Role,
    columns: {
        username: {
            primary: true,
            type: "varchar",
        },
        role: {
            type: "varchar"
        }
    }
});
