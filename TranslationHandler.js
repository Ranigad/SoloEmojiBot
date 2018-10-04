"use strict";

const fs = require("fs");
const stringify = require("csv-stringify-as-promised");
const parse = require("csv-parse");
const typeorm = require('typeorm');
const entityManager = typeorm.getManager();

const MasterMeguca = require('./model/MasterMeguca').MasterMeguca;
const MasterMemoria = require('./model/MasterMemoria').MasterMemoria;

const export_data = async (channel) => {
    let now = new Date().toUTCString();
    const memes = await entityManager.createQueryBuilder(MasterMemoria, "MasterMemoria")
        .getMany();
    const memeArray = [];
    for (var meme of memes) {
        memeArray.push([meme.jpn_name, meme.eng_name]);
    }

    const girls = await entityManager.createQueryBuilder(MasterMeguca, "MasterMeguca")
        .getMany();
    const girlArray = [];
    for (var girl of girls) {
        girlArray.push([girl.jpn_name, girl.eng_sur, girl.eng_given, girl.nick]);
    }

    try {
        let output = await stringify(memeArray);
        await fs.writeFile(`temp/memoria-${now}.csv`, output);
        output = await stringify(girlArray);
        await fs.writeFile(`temp/girls-${now}.csv`, output);
        await channel.send({files: [`temp/memoria-${now}.csv`, `temp/girls-${now}.csv`]});
        fs.unlink(`temp/memoria-${now}.csv`);
        fs.unlink(`temp/girls-${now}.csv`);
    }
    catch(err) {
        console.log(err);
    }


}


module.exports = {
    export_data
}


