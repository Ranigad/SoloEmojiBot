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
        support_type: {
            type: "int"
        },
        bonus: {
            type: "int",
            nullable: true
        },
        level: {
            type: "int",
            default: 1
        },
        magia_level: {
            type: "int",
            default: 1
        },
        revision: {
            type: "int",
            default: 0
        },
        slots: {
            type: "int",
            default: 0
        },
        attack: {
            type: "int",
            default: 1
        },
        defense: {
            type: "int",
            default: 1
        },
        hp: {
            type: "int",
            default: 1
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
            inverseSide: "meguca",
            joinTable: false,
            cascade: false
        }
    }
});
