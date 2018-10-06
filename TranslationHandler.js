"use strict";

const fs = require("fs");
const stringify = require("csv-stringify-as-promised");
const Papa = require("papaparse");
const typeorm = require('typeorm');
const entityManager = typeorm.getManager();
const https = require("https");

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

const process_girls = async (girls) => {
    for (var girl of girls) {
        if (girl.length != 4) continue;
        await entityManager
                .createQueryBuilder()
                .update(MasterMeguca)
                .set({eng_sur: girl[1], eng_given: girl[2], nick: girl[3]})
                .where("jpn_name = :name", {name: girl[0]})
                .execute();
    }
}

const process_memes = async (memes) => {
    for (var meme of memes) {
        if (meme.length != 2) continue;
        await entityManager
                .createQueryBuilder()
                .update(MasterMemoria)
                .set({eng_name: meme[1]})
                .where("jpn_name = :name", {name: meme[0]})
                .execute();
    }
}

const process_data = async (message) => {
    if (message.channel.guild.id =! process.env.TEST_SERVER || message.guild.id == process.env.PROD_SERVER) {
        return;
    }

    let attachments = message.attachments;
    if (attachments == undefined || attachments.array() == undefined || attachments.array().length != 1) return;
    attachments = attachments.array();
    let attachment = attachments[0];
    if (attachment.url == undefined) return;
    let callback = undefined;
    if (attachment.filename == "girls.csv") callback = process_girls;
    else if (attachment.filename == "memoria.csv") callback = process_memes;
    else return;

    let url = attachment.url;
    let file_name = message.author.username + new Date().toUTCString();
    let file = fs.createWriteStream(`temp/${file_name}`);
    let request = https.get(url, async function(response) {
        response.pipe(file).on('finish', async function() {
            // Process CSV data

            Papa.parse(fs.createReadStream(`temp/${file_name}`), {
                complete: async function(results) {
                    //console.log(results);
                    let data = results.data;
                    await callback(data);
                    fs.unlink(`temp/${file_name}`);
                    message.reply("the translations were successfully updated");
                }
            });
        });
    });
}


module.exports = {
    export_data,
    process_data
}


