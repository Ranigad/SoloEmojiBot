const EntitySchema = require("typeorm").EntitySchema;
const MasterMeguca = require("../model/MasterMeguca").MasterMeguca;
const Meguca = require("../model/Meguca").Meguca;

module.exports = new EntitySchema({
    name: "MasterMeguca",
    target: MasterMeguca,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        jpn_name: {
            type: "varchar"
        },
        eng_sur: {
            type: "varchar"
        },
        eng_given: {
            type: "varchar"
        },
        nick: {
            type: "varchar"
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
