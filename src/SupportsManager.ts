
import * as fs from "fs";
import * as path from "path";
import * as rp from "request-promise";
import * as typeorm from "typeorm";

import { Logger } from "./Logger";

const entityManager = typeorm.getManager();
import {MagiRecoUser} from "./entity/MagiRecoUser";
import {MasterMeguca} from "./entity/MasterMeguca";
import {MasterMemoria} from "./entity/MasterMemoria";
import {Meguca} from "./entity/Meguca";
import {Memoria} from "./entity/Memoria";
import * as Util from "./Util";

export class SupportsManager {

    loadingInvites: number[];
    loadingIds: number[];
    callbacks: any[];
    bot: any;

    constructor() {
        this.loadingInvites = []; // Invites currently loading from friend-search
        this.loadingIds = []; // Ids currently loading from support query
        this.callbacks = [];
    }

    clearPendingLoads() {
        this.loadingInvites.length = 0;
        this.loadingIds.length = 0;
    }

    async repeatQuery(options, occurence) {
        try {
            const data = await rp(options);
            return data;
        } catch (error) {
            Logger.log(error);
            occurence--;
            if (occurence > 0) {
                if (options.proxy !== undefined) {
                    options.proxy = await this.getProxy();
                }
                this.repeatQuery(options, occurence);
            } else { return undefined; }
        }
    }

    async getProxy() {
        const options = {
            method: "GET",
            uri: "https://rice.qyu.be/cgi-bin/pixiedust.sh",
        };
        const proxy = await this.repeatQuery(options, 2);
        Logger.log(proxy);
        Util.log_general(`Proxy: ${proxy}`, this.bot);
        if (proxy !== undefined) {
            return `http://${proxy}`;
        } else {
            return undefined;
        }
    }

    testFriendsParsing() {
        const friendDataPath = path.normalize(`./data/friendsearch.json`);
        if (fs.existsSync(friendDataPath)) {
            this.parseFriends(fs.readFileSync(friendDataPath));
        }
    }

    testSupportsParsing() {
        const supportsPath = path.normalize(`./data/supports.json`);
        if (fs.existsSync(supportsPath)) {
            this.parseSupports(fs.readFileSync(supportsPath));
        }
    }

    testQueries() {
        this.fetchUserWithInvite({inviteCode: "396utQVZ"});
        // this.fetchUserWithId({id: "cd24b2f4-8b78-11e7-a2dd-062632d8f11c"});
    }

    async fetchUserWithInvite(inviteCodeRequest) {
        const inviteCode = inviteCodeRequest.inviteCode;
        const callback = inviteCodeRequest.callback;

        if (inviteCode === undefined) {
            Logger.log("Error: Cannot fetch user with undefined invite code");
            Util.log_general("Error: Cannot fetch user with undefined invite code", this.bot);
            return;
        }

        if (callback !== undefined) {
            this.callbacks.push(inviteCodeRequest);
        }

        if (this.loadingInvites.includes(inviteCode)) {
            Logger.log(`A fetch for user ${inviteCode} has already begun`);
            Util.log_general(`A fetch for user ${inviteCode} has already begun`, this.bot);
            return;
        } else {
            this.loadingInvites.push(inviteCode);
        }

        const data = await this.queryFriendSearch(inviteCode);

        if (data === undefined) {
            Logger.log(data);
            Logger.log(`ERROR: Fetching user ${inviteCode} with friend search failed`);
            Util.log_general(`ERROR: Fetching user ${inviteCode} with friend search failed`, this.bot);
            this.callbacks.filter((e) => e.inviteCode === inviteCode)
                .forEach((e) => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter((e) => e.inviteCode !== inviteCode);
            this.loadingInvites = this.loadingInvites.filter((e) => e !== inviteCode);
            return;
        }

        const ids = this.parseFriends(data);

        if (ids === undefined || ids.length === 0 || ids[0] === undefined) {
            Logger.log(`ERROR: Fetching user ${inviteCode} with friend search failed`);
            this.callbacks.filter((e) => e.inviteCode === inviteCode)
                .forEach((e) => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter((e) => e.inviteCode !== inviteCode);
            this.loadingInvites = this.loadingInvites.filter((e) => e !== inviteCode);
            return;
        }

        const id = ids[0];

        await this.fetchUserWithId(id);
    }

    async fetchUserWithId(idRequest) {
        const id = idRequest.id;
        const callback = idRequest.callback;
        const inviteCode = idRequest.inviteCode;

        if (id === undefined) {
            Logger.log("Error: Cannot fetch user with undefined Id");
            Util.log_general("Error: Cannot fetch user with undefined Id", this.bot);
            return;
        }

        if (callback !== undefined) {
            this.callbacks.push(idRequest);
        }

        if (this.loadingIds.includes(id)) {
            Logger.log(`A fetch for user ${id} has already begun`);
            Util.log_general(`A fetch for user ${id} has already begun`, this.bot);
            return;
        } else {
            this.loadingIds.push(id);
        }

        const ids = [];
        ids.push(id);
        const inviteCodes = [];
        inviteCodes.push(inviteCode);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        Logger.log(yesterday.toUTCString());
        // const users = await entityManager.createQueryBuilder("user")
        //     .from(MagiRecoUser, "user")
        //     .where("user.updatetimestamp < :date", {date: yesterday})
        //     .getMany();

        // const users = await entityManager.getRepository(MagiRecoUser)
        //     .find({
        //         where: {updatetimestamp: LessThan(yesterday.toUTCString())}
        //     });

        // Logger.log(entityManager.createQueryBuilder(MagiRecoUser)
        // .where({updatetimestamp: LessThan(yesterday.toUTCString())}).getSql());

        const sql = await entityManager.createQueryBuilder(MagiRecoUser, "user")
            .where("user.updatetimestamp < :date", {date: yesterday.toUTCString()})
            .orderBy("user.updatetimestamp", "ASC")
            .getSql();
        Logger.log(sql);

        const users = await entityManager.createQueryBuilder(MagiRecoUser, "user")
            .where("user.updatetimestamp < :date", {date: yesterday.toUTCString()})
            .orderBy("user.updatetimestamp", "ASC")
            .getMany();

        for (const user of users) {
            Logger.log(user.user_id);
            Logger.log(user.updatetimestamp);
            if (ids.length === 15) {
                break;
            }
            if (this.loadingIds.includes(+user.user_id) || ids.includes(user.user_id)) {
                continue;
            } else {
                this.loadingIds.push(+user.user_id);
                ids.push(user.user_id);
                inviteCodes.push(user.friend_id);
            }
        }

        Logger.log(JSON.stringify(ids));
        const idString = ids.join();
        Logger.log(idString);

        const data = await this.querySupportSearch(idString);

        if (data === undefined) {
            Logger.log(`ERROR: Fetching users ${idString} (including ${inviteCode}) with support search failed`);
            Util.log_general(`ERROR: Fetching users ${idString} (including ${inviteCode}) with support search failed`, this.bot);
            this.loadingInvites = this.loadingInvites.filter((e) => e !== inviteCode);
            this.loadingIds = this.loadingIds.filter((e) => !ids.includes(e));

            // Handle callbacks
            this.callbacks.filter((e) => inviteCodes.includes(e.inviteCode))
                .forEach((e) => Logger.log(e));
            this.callbacks.filter((e) => inviteCodes.includes(e.inviteCode))
                .forEach((e) => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter((e) => e.inviteCode !== inviteCode);
            return;
        }

        const parsedUsers = await this.parseSupports(data);

        if (parsedUsers === undefined) {
            Logger.log(`ERROR: Parsing support data for users ${idString} (including ${inviteCode}) with support search failed`);
            Util.log_general(`ERROR: Parsing support data for users ${idString} (including ${inviteCode}) with support search failed`, this.bot);
            this.loadingInvites = this.loadingInvites.filter((e) => e !== inviteCode);
            this.loadingIds = this.loadingIds.filter((e) => !ids.includes(e));

            // Handle callbacks
            this.callbacks.filter((e) => inviteCodes.includes(e.inviteCode))
                .forEach((e) => Logger.log(e));
            this.callbacks.filter((e) => inviteCodes.includes(e.inviteCode))
                .forEach((e) => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter((e) => e.inviteCode !== inviteCode);
            return;
        }
        // Logger.log(parsedUsers);

        Logger.log(yesterday.toUTCString());

        this.loadingInvites = this.loadingInvites.filter((e) => e !== inviteCode);
        this.loadingIds = this.loadingIds.filter((e) => !ids.includes(e));

        // Handle callbacks
        this.callbacks.filter((e) => e.inviteCode === inviteCode)
            .forEach((e) => e.callback(true, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
        this.callbacks = this.callbacks.filter((e) => e.inviteCode !== inviteCode);
    }

    /** Friend Search - General Player Information */
    async queryFriendSearch(inviteCode) {
        const query_string = `inviteCode: ${inviteCode}`;

        const url = "https://android.magi-reco.com/search/friend_search/_search";
        const proxy = await this.getProxy();

        const options = {
            method: "POST",
            uri: url,
            proxy,
            gzip: true,
            headers: {

                // tslint:disable-next-line
                "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; SAMSUNG-SM-N900A Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Crosswalk/23.53.589.4 Safari/537.36",
                "content-Type": "application/json",
                "user-id-fba9x88mae": "8badf00d-dead-4444-beef-deadbeefcafe",
                "charset": "UTF-16",
            },
            body: JSON.stringify({
                query: {
                    query_string: {
                        query: query_string,
                        lenient: true,
                    },
                },
                stored_fields: "*",
                size: 50,
            })
        };
        // Logger.log(result);
        return await this.repeatQuery(options, 4);
    }

    /** Support Select - Support Data */
    async querySupportSearch(idString) {
        const userid = process.env.USER_ID;
        const url = "https://android.magi-reco.com/magica/api/page/SupportSelect";
        const proxy = await this.getProxy();

        const options = {
            method: "POST",
            uri: url,
            proxy,
            gzip: true,
            headers: {
                // tslint:disable-next-line
                "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; SAMSUNG-SM-N900A Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Crosswalk/23.53.589.4 Safari/537.36",
                "content-Type": "application/json",
                "user-id-fba9x88mae": userid,
                "f4s-client-ver": "3",
            },
            body: JSON.stringify({
                strUserIds: idString
            })
        };
        const result = await this.repeatQuery(options, 4);
        // Logger.log(result);
        return result;
    }

    parseFriends(data) {
        Logger.log(data);
        data = JSON.parse(data);
        if (data === undefined) {
            return undefined;
        }
        if ("resultCode" in data) {
            Logger.log(`ERROR: The query failed: ${data.resultCode}`);
            return undefined;
        }
        if (data.hits.total <= 0) {
            Logger.log("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return undefined;
        }

        const results = [];

        for (const hit of data.hits.hits) {
            const result = {id: hit.fields.id[0], inviteCode: hit.fields.inviteCode[0]};
            results.push(result);
        }

        Logger.log(results);
        return results;
    }

    async parseSupports(data) {
        // Logger.log(data);
        data = JSON.parse(data);
        if (data === undefined) {
            return undefined;
        }
        if ("interrupt" in data || !("supportUserList" in data)) {
            Logger.log(`ERROR: The query failed: ${JSON.stringify(data)}`);
            return undefined;
        }
        if (data.supportUserList.length === 0) {
            Logger.log("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return undefined;
        }

        const allMemes = [];
        let memes: Memoria[];
        const allGirls = [];
        let doppelIds: number[];
        let doppelGirlNames: any[];

        const userIds = [];

        let user: any = new MagiRecoUser();
        for (const supportUserIndex in data.supportUserList) {
            memes = [];
            doppelIds = [];
            doppelGirlNames = [];

            const supportUser = data.supportUserList[supportUserIndex];

            userIds.push(supportUser.userId);

            user = await entityManager.getRepository(MagiRecoUser).findOne({user_id: supportUser.userId});
            if (user === undefined) {
                user = new MagiRecoUser();
                user.addtimestamp = new Date();
            }
            user.user_id = supportUser.userId;
            user.friend_id = supportUser.inviteCode;
            user.display_name = supportUser.userName;
            user.user_rank = supportUser.userRank;
            user.class_rank = supportUser.definitiveClassRank;
            user.last_access = supportUser.lastAccessDate;
            user.comment = supportUser.comment;
            user.updatetimestamp = new Date();
            user = await entityManager.save(user);

            user = await entityManager.getRepository(MagiRecoUser).findOne({where: {user_id: supportUser.userId}, relations: ["meguca"]});
            const savedGirls = user.meguca;
            for (const girl in savedGirls) {
                await typeorm.getConnection().createQueryBuilder()
                    .delete()
                    .from(Memoria)
                    .where("megucaId = :meguca", {meguca: savedGirls[girl].id})
                    .execute();
                await entityManager.remove(savedGirls[girl]);
            }

            if (!("userDoppelList" in supportUser) || supportUser.userDoppelList.length === 0) {
                // No Doppels
            } else {
                for (const index in supportUser.userDoppelList) {
                    const doppelData = supportUser.userDoppelList[index];
                    doppelIds.push(doppelData.doppelId);
                }
            }

            const titleDict = {};

            if (!("userCharaList" in supportUser) || supportUser.userCharaList.length === 0) {
                // No Characters - something probably isn't right
            } else {
                for (const index in supportUser.userCharaList) {
                    const characterData = supportUser.userCharaList[index];
                    // if (supportUser.inviteCode === "Q69KBCAA") Logger.log(characterData);//396utQVZ
                    if (!("chara" in characterData) || characterData.chara === undefined ||
                        !("doppel" in characterData.chara) || characterData.chara.doppel === undefined ||
                        !("id" in characterData.chara.doppel) ||
                        characterData.chara.doppel.id === undefined ||
                        !("name" in characterData.chara) || characterData.chara.name === undefined) {
                            continue;
                    }

                    const title = characterData.chara.title;
                    if (title) {
                        titleDict[characterData.chara.id] = title;
                    }

                    if (doppelIds.includes(characterData.chara.doppel.id)) {
                        doppelGirlNames.push({name: characterData.chara.name, title});
                    }
                }
            }

            if (!("userPieceList" in supportUser) || supportUser.userPieceList.length === 0) {
                // No Memoria
            } else {
                for (const memeIndex in supportUser.userPieceList) {
                    const memeData = supportUser.userPieceList[memeIndex];
                    const memeName = memeData.piece.pieceName;

                    let masterMeme = await entityManager.getRepository(MasterMemoria).findOne({jpn_name: memeName});
                    if (masterMeme === null) {
                        masterMeme = new MasterMemoria();
                        masterMeme.jpn_name = memeName;
                        if (memeData.piece.pieceType === "SKILL") {
                            masterMeme.active = false;
                        } else {
                            masterMeme.active = true;
                        }

                        masterMeme.rating = parseInt(memeData.piece.rank.replace("RANK_", ""), 10);

                        masterMeme = await entityManager.save(masterMeme);
                    }

                    const meme: any = new Memoria();
                    meme.masterMemoria = masterMeme;
                    meme.lbCount = memeData.lbCount;
                    meme.level = memeData.level;
                    meme.memoriaId = memeData.id;
                    meme.hp = memeData.hp;
                    meme.attack = memeData.attack;
                    meme.defense = memeData.defense;

                    memes.push(meme);
                }
            }

            if (!("userCardList" in supportUser) || supportUser.userCardList.length === 0) {
                // No Supports
            } else {
                for (const megucaIndex in supportUser.userCardList) {
                    const supportMeguca = supportUser.userCardList[megucaIndex];
                    let girlName = supportMeguca.card.cardName;
                    const mainGirlName = girlName;
                    const title = titleDict[supportMeguca.card.charaNo];
                    // Logger.log(title);
                    if (title) { girlName = `${girlName} (${title})`; }
                    // Logger.log(girlName);

                    let masterMeguca = await entityManager.getRepository(MasterMeguca).findOne({jpn_name: girlName});
                    if (masterMeguca === null) {
                        const girlAtt = supportMeguca.card.attributeId;

                        const attributes = ["VOID", "FIRE", "WATER", "TIMBER", "LIGHT", "DARK"];
                        let attributeVal = attributes.indexOf(girlAtt);

                        if (attributeVal !== -1) { attributeVal++; }

                        masterMeguca = new MasterMeguca();
                        masterMeguca.jpn_name = girlName;
                        masterMeguca.meguca_type = attributeVal;

                        masterMeguca = await entityManager.save(masterMeguca);
                    }

                    const meguca = new Meguca();
                    meguca.masterMeguca = masterMeguca;
                    const positionIdNum = parseInt(megucaIndex, 10) + 1;
                    const positionId = "questPositionId" + positionIdNum;
                    meguca.support_type = parseInt(supportUser.userDeck[positionId], 10);
                    meguca.level = parseInt(supportMeguca.level, 10);
                    meguca.magia_level = parseInt(supportMeguca.magiaLevel, 10);
                    meguca.revision = parseInt(supportMeguca.revision, 10);
                    meguca.attack = parseInt(supportMeguca.attack, 10);
                    meguca.defense = parseInt(supportMeguca.defense, 10);
                    meguca.hp = parseInt(supportMeguca.hp, 10);
                    meguca.user = user;

                    const checkDoppel = doppelGirlNames.filter((value) => value.name === mainGirlName && value.title === title);
                    if (checkDoppel.length > 0) {
                        meguca.magia_level = 6;
                    }

                    let slots = meguca.revision + 1;
                    for (let i = 1; i <= slots; i++) {
                        const field = "userPieceId0" + positionIdNum + i;
                        if (!(field in supportUser.userDeck) || supportUser.userDeck[field] === undefined) {
                            slots--;
                            continue;
                        }

                        const memeId = supportUser.userDeck[field];
                        const meme: any = memes.find((element) => {
                            return element.id === memeId;
                        });
                        if (meme !== undefined) {
                            meguca.hp += meme.hp;
                            meguca.attack += meme.attack;
                            meguca.defense += meme.defense;
                            delete meme.hp;
                            delete meme.attack;
                            delete meme.defense;
                            meme.meguca = meguca;
                            delete meme.memoriaId;
                            allMemes.push(meme);
                        } else { slots--; }
                    }

                    meguca.slots = slots;

                    allGirls.push(meguca);
                }
            }
        }

        await entityManager.save(allGirls);
        await entityManager.save(allMemes);

        const users = [];
        for (const userIdIndex in userIds) {
            const userId = userIds[userIdIndex];
            user = await entityManager.getRepository(MagiRecoUser).findOne({user_id: userId});
            users.push(user);
        }
        Logger.log(`Parsed ${users.length} user accounts`);
        Util.log_general(`Parsed ${users.length} user accounts`, this.bot);
        return users;
    }

}
