
import * as stringify from "csv-stringify-as-promised";
import * as fs from "fs";
import * as https from "https";
import * as Papa from "papaparse";
import * as typeorm from "typeorm";

const entityManager = typeorm.getManager();

import {MasterMeguca} from "./entity/MasterMeguca";
import {MasterMemoria} from "./entity/MasterMemoria";
import { Logger } from "./Logger";

export async function export_data(channel) {
    const now = new Date().toUTCString();
    const memes = await entityManager.createQueryBuilder(MasterMemoria, "MasterMemoria")
        .getMany();
    const memeArray = [];
    for (const meme of memes) {
        memeArray.push([meme.jpn_name, meme.eng_name]);
    }

    const girls = await entityManager.createQueryBuilder(MasterMeguca, "MasterMeguca")
        .getMany();
    const girlArray = [];
    for (const girl of girls) {
        girlArray.push([girl.jpn_name, girl.eng_sur, girl.eng_given, girl.nick]);
    }

    try {
        let output = await stringify(memeArray);
        fs.writeFileSync(`temp/memoria-${now}.csv`, output);

        output = await stringify(girlArray);
        fs.writeFileSync(`temp/girls-${now}.csv`, output);

        await channel.send({files: [`temp/memoria-${now}.csv`, `temp/girls-${now}.csv`]});
        fs.unlinkSync(`temp/memoria-${now}.csv`);
        fs.unlinkSync(`temp/girls-${now}.csv`);
    } catch (err) {
        Logger.log(err);
    }

}

const process_girls = async (girls) => {
    for (const girl of girls) {
        if (girl.length !== 4) { continue; }
        await entityManager
                .createQueryBuilder()
                .update(MasterMeguca)
                .set({eng_sur: girl[1], eng_given: girl[2], nick: girl[3]})
                .where("jpn_name = :name", {name: girl[0]})
                .execute();
    }
};

const process_memes = async (memes) => {
    for (const meme of memes) {
        if (meme.length !== 2) { continue; }
        await entityManager
                .createQueryBuilder()
                .update(MasterMemoria)
                .set({eng_name: meme[1]})
                .where("jpn_name = :name", {name: meme[0]})
                .execute();
    }
};

export const process_data = async (message) => {
    if (message.channel.guild.id !== process.env.TEST_SERVER) {
        return;
    }

    let attachments = message.attachments;
    if (attachments === undefined || attachments.array() === undefined || attachments.array().length !== 1) { return; }
    attachments = attachments.array();
    const attachment = attachments[0];

    if (attachment.url === undefined) { return; }

    let callback;
    if (attachment.filename === "girls.csv") {
        callback = process_girls;
    } else if (attachment.filename === "memoria.csv") {
        callback = process_memes;
    }

    if (!callback) { return; }

    const url = attachment.url;
    const file_name = message.author.username + new Date().toUTCString();
    const file = fs.createWriteStream(`temp/${file_name}`);
    https.get(url, async (response) => {
        response.pipe(file).on("finish", async () => {
            // Process CSV data

            Papa.parse(fs.createReadStream(`temp/${file_name}`), {
                async complete(results) {
                    // Logger.log(results);
                    const data = results.data;
                    await callback(data);
                    fs.unlinkSync(`temp/${file_name}`);
                    message.reply("the translations were successfully updated");
                }
            });
        });
    });
};
