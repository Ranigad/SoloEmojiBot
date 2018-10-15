const EntitySchema = require("typeorm").EntitySchema;
const Guild = require("../model/Guild").Guild;

module.exports = new EntitySchema({
    name: "Guild",
    target: Guild,
    columns: {
        guild_id: {
            primary: true,
            type: "varchar"
        },
        prefix: {
            type: "varchar"
        }
    }
});
