const EntitySchema = require("typeorm").EntitySchema;
const MagiRecoUser = require("../model/MagiRecoUser").MagiRecoUser;

module.exports = new EntitySchema({
    name: "MagiRecoUser",
    target: MagiRecoUser,
    columns: {
        user_id: {
            primary: true,
            type: "varchar"
        },
        friend_id: {
            unique: true,
            type: "varchar"
        },
        display_name: {
            type: "varchar"
        },
        user_rank: {
            type: "int"
        },
        class_rank: {
            type: "varchar"
        },
        last_access: {
            nullable: true,
            type: "date"
        },
        comment: {
            default: "",
            type: "varchar"
        },
        addtimestamp: {
            type: "date"
        },
        updatetimestamp: {
            type: "date"
        }
    }
});
