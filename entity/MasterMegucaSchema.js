const EntitySchema = require("typeorm").EntitySchema;
const MasterMeguca = require("../model/MasterMeguca").MasterMeguca;
const Meguca = require("../model/Meguca").Meguca;

module.exports = new EntitySchema({
    name: "MasterMeguca",
    target: MasterMeguca,
    columns: {
        jpn_name: {
            primary: true,
            type: "varchar"
        },
        eng_sur: {
            type: "varchar",
            nullable: true
        },
        eng_given: {
            type: "varchar",
            nullable: true
        },
        nick: {
            type: "varchar",
            nullable: true
        },
        meguca_type: {
            type: "int",
            nullable: true
        }
    },
    relations: {
        meguca: {
            target: "Meguca",
            type: "one-to-many",
            joinTable: false,
            cascade: true
        }
    }
});
