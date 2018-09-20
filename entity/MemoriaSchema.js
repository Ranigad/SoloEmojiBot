const EntitySchema = require("typeorm").EntitySchema;
const Memoria = require("../model/Memoria").Memoria;
const MasterMemoria = require("../model/MasterMemoria").MasterMemoria;
const Meguca = require("../model/Meguca").Meguca;

module.exports = new EntitySchema({
    name: "Memoria",
    target: Memoria,
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        mlb: {
            type: "boolean",
            default: false
        },
        level: {
            type: "int",
            default: 1
        }
    },
    relations: {
        masterMemoria: {
            target: "MasterMemoria",
            type: "many-to-one",
            joinTable: false,
            cascade: false
        },
        meguca: {
            target: "Meguca",
            type: "many-to-one",
            joinTable: false,
            cascade: false
        }
    }
});
