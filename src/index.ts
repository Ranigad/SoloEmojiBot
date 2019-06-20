import "reflect-metadata";
import {createConnection} from "typeorm";

// import {User} from "./entity/User";
import {Guild} from "./entity/Guild";
import {Role} from "./entity/Role";
import { Logger } from "./Logger";

createConnection().then(async (connection) => {

    const role = new Role();
    role.username = "100702184395513856";
    role.role = "developer";
    await connection.manager.save(role);

    const discord = require("./bot.ts");

    const guilds = await connection.manager.find(Guild);
    if (guilds === undefined || guilds.length === 0) {
        const testserver = new Guild();
        testserver.guild_id = "471030229629009925";
        testserver.prefix = "\\";
        await connection.manager.save(testserver);
        const madocord = new Guild();
        madocord.guild_id = "364704870177046531";
        madocord.prefix = "\\";
        await connection.manager.save(madocord);
    }

}).catch((error) => Logger.log(error));
