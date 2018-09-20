const EntitySchema = require("typeorm").EntitySchema;
const Meguca = require("../model/Meguca").Meguca;
const MasterMeguca = require("../model/MasterMeguca").MasterMeguca;
const Memoria = require("../model/Memoria").Memoria;
const MagiRecoUser = require("../model/MagiRecoUser").MagiRecoUser;

module.exports = new EntitySchema({
    name: "Meguca",
    target: Meguca,
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
        masterMeguca: {
            target: "MasterMeguca",
            type: "many-to-one",
            joinTable: false,
            cascade: false
        },
        memes: {
            target: "Memoria",
            type: "one-to-many",
            joinTable: false,
            cascade: true
        },
        user: {
            target: "MagiRecoUser",
            type: "many-to-one",
            joinTable: false,
            cascade: false
        }
    }
});
