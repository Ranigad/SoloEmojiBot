const EntitySchema = require("typeorm").EntitySchema;
const MasterMemoria = require("../model/MasterMemoria").MasterMemoria;
const Memoria = require("../model/Memoria").Memoria;

module.exports = new EntitySchema({
    name: "MasterMemoria",
    target: MasterMemoria,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        jpn_name: {
            type: "varchar"
        },
        eng_name: {
            type: "varchar",
            nullable: true
        },
        active: {
            type: "boolean",
            nullable: true
        },
        rating: {
            type: "int",
            nullable: true
        }
    },
    relations: {
        memes: {
            target: "Memoria",
            type: "one-to-many",
            joinTable: false,
            cascade: true
        }
    }
});