"use strict";
const path = require('path');
const fs = require('fs');
const typeorm = require('typeorm');
const entityManager = typeorm.getManager();
const MagiRecoUser = require('./model/MagiRecoUser').MagiRecoUser;
const MasterMeguca = require('./model/MasterMeguca').MasterMeguca;
const Meguca = require('./model/Meguca').Meguca;
const MasterMemoria = require('./model/MasterMemoria').MasterMemoria;
const Memoria = require('./model/Memoria').Memoria;
const rp = require('request-promise');
const LessThan = typeorm.LessThan;
const Util = require("./Util.js");


module.exports = class SupportsManager {
    constructor() {
        this.loadingInvites = []; // Invites currently loading from friend-search
        this.loadingIds = []; // Ids currently loading from support query
        this.callbacks = [];
    }

    async repeatQuery(options, occurence) {
        try {
            let data = await rp(options);
            return data;
        }
        catch (error) {
            console.log(error);
            occurence--;
            if (occurence > 0) {
                if (options.proxy != undefined) {
                    options.proxy = await this.getProxy();
                }
                this.repeatQuery(options, occurence);
            }
            else return undefined;
        }
    }

    async getProxy() {
        var options = {
            method: "GET",
            uri: "https://rice.qyu.be/cgi-bin/pixiedust.sh",
        };
        var proxy = await this.repeatQuery(options, 2);
        console.log(proxy);
        Util.log_general(`Proxy: ${proxy}`, this.bot);
        if (proxy != undefined) {
            return `http://${proxy}`;
        }
        else {
            return undefined;
        }
    }

    testFriendsParsing() {
        var friendDataPath = path.normalize(`./data/friendsearch.json`);
        var data = "";
        if (fs.existsSync(friendDataPath)) {
            data = fs.readFileSync(friendDataPath);
        }
        this.parseFriends(data);
    }

    testSupportsParsing() {
        var supportsPath = path.normalize(`./data/supports.json`);
        var data = "";
        if (fs.existsSync(supportsPath)) {
            data = fs.readFileSync(supportsPath);
        }
        this.parseSupports(data);
    }

    testQueries() {
        this.fetchUserWithInvite({inviteCode: "396utQVZ"});
        //this.fetchUserWithId({id: "cd24b2f4-8b78-11e7-a2dd-062632d8f11c"});
    }

    async fetchUserWithInvite(inviteCodeRequest) {
        var inviteCode = inviteCodeRequest.inviteCode;
        var callback = inviteCodeRequest.callback;

        if (inviteCode == undefined) {
            console.log("Error: Cannot fetch user with undefined invite code");
            Util.log_general("Error: Cannot fetch user with undefined invite code", this.bot);
            return;
        }

        if (callback != undefined) {
            this.callbacks.push(inviteCodeRequest);
        }

        if (this.loadingInvites.includes(inviteCode)) {
            console.log(`A fetch for user ${inviteCode} has already begun`);
            Util.log_general(`A fetch for user ${inviteCode} has already begun`, this.bot);
            return;
        }
        else {
            this.loadingInvites.push(inviteCode);
        }

        var data = await this.queryFriendSearch(inviteCode);

        if (data == undefined) {
            console.log(data);
            console.log(`ERROR: Fetching user ${inviteCode} with friend search failed`);
            Util.log_general(`ERROR: Fetching user ${inviteCode} with friend search failed`, this.bot);
            this.callbacks.filter(e => e.inviteCode == inviteCode)
                .forEach(e => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter(e => e.inviteCode != inviteCode);
            this.loadingInvites = this.loadingInvites.filter(e => e != inviteCode);
            return;
        }

        var ids = this.parseFriends(data);

        if (ids == undefined || ids.length == 0 || ids[0] == undefined) {
            console.log(`ERROR: Fetching user ${inviteCode} with friend search failed`);
            this.callbacks.filter(e => e.inviteCode == inviteCode)
                .forEach(e => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter(e => e.inviteCode != inviteCode);
            this.loadingInvites = this.loadingInvites.filter(e => e != inviteCode);
            return;
        }

        var id = ids[0];

        await this.fetchUserWithId(id);
    }

    async fetchUserWithId(idRequest) {
        var id = idRequest.id;
        var callback = idRequest.callback;
        var inviteCode = idRequest.inviteCode;

        if (id == undefined) {
            console.log("Error: Cannot fetch user with undefined Id");
            Util.log_general("Error: Cannot fetch user with undefined Id", this.bot);
            return;
        }

        if (callback != undefined) {
            this.callbacks.push(idRequest);
        }

        if (this.loadingIds.includes(id)) {
            console.log(`A fetch for user ${id} has already begun`);
            Util.log_general(`A fetch for user ${id} has already begun`, this.bot);
            return;
        }
        else {
            this.loadingIds.push(id);
        }

        var ids = [];
        ids.push(id);
        var inviteCodes = [];
        inviteCodes.push(inviteCode);

        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        console.log(yesterday.toUTCString());
        // const users = await entityManager.createQueryBuilder("user")
        //     .from(MagiRecoUser, "user")
        //     .where("user.updatetimestamp < :date", {date: yesterday})
        //     .getMany();

        // const users = await entityManager.getRepository(MagiRecoUser)
        //     .find({
        //         where: {updatetimestamp: LessThan(yesterday.toUTCString())}
        //     });
        
        // console.log(entityManager.createQueryBuilder(MagiRecoUser)
        // .where({updatetimestamp: LessThan(yesterday.toUTCString())}).getSql());

        const sql = await entityManager.createQueryBuilder(MagiRecoUser, "user")
            .where("user.updatetimestamp < :date", {date: yesterday.toUTCString()})
            .orderBy("user.updatetimestamp", "ASC")
            .getSql();
        console.log(sql);

        const users = await entityManager.createQueryBuilder(MagiRecoUser, "user")
            .where("user.updatetimestamp < :date", {date: yesterday.toUTCString()})
            .orderBy("user.updatetimestamp", "ASC")
            .getMany();

        for (var user of users) {
            console.log(user.user_id);
            console.log(user.updatetimestamp);
            if (ids.length == 15) {
                break;
            }
            if (this.loadingIds.includes(user.user_id) || ids.includes(user.user_id)) {
                continue;
            }
            else {
                this.loadingIds.push(user.user_id);
                ids.push(user.user_id);
                inviteCodes.push(user.friend_id);
            }
        }

        console.log(JSON.stringify(ids));
        var idString = ids.join();
        console.log(idString);

        var data = await this.querySupportSearch(idString);

        if (data == undefined) {
            console.log(`ERROR: Fetching users ${idString} (including ${inviteCode}) with support search failed`);
            Util.log_general(`ERROR: Fetching users ${idString} (including ${inviteCode}) with support search failed`, this.bot);
            this.loadingInvites = this.loadingInvites.filter(e => e != inviteCode);
            this.loadingIds = this.loadingIds.filter(e => !ids.includes(e));

            // Handle callbacks
            this.callbacks.filter(e => inviteCodes.includes(e.inviteCode))
                .forEach(e => console.log(e));
            this.callbacks.filter(e => inviteCodes.includes(e.inviteCode))
                .forEach(e => e.callback(false, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
            this.callbacks = this.callbacks.filter(e => e.inviteCode != inviteCode);
            return;
        }

        var parsedUsers = await this.parseSupports(data);
        //console.log(parsedUsers);

        console.log(yesterday.toUTCString());

        this.loadingInvites = this.loadingInvites.filter(e => e != inviteCode);
        this.loadingIds = this.loadingIds.filter(e => !ids.includes(e));

        // Handle callbacks
        this.callbacks.filter(e => e.inviteCode == inviteCode)
            .forEach(e => e.callback(true, e.message, e.initialMessage, e.inviteCode, e.user, e.bmfun));
        this.callbacks = this.callbacks.filter(e => e.inviteCode != inviteCode);
    }

    /** Friend Search - General Player Information */
    async queryFriendSearch(inviteCode) {
        var query_string = `inviteCode: ${inviteCode}`;

        var url = "https://android.magi-reco.com/search/friend_search/_search";
        var proxy = await this.getProxy();

        var options = {
            method: "POST",
            uri: url,
            proxy: proxy,
            gzip: true,
            headers: {
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
        var result = await this.repeatQuery(options, 4);
        //console.log(result);
        return result;
    }

    /** Support Select - Support Data */
    async querySupportSearch(idString) {
        const userid = process.env.USER_ID;
        var url = "https://android.magi-reco.com/magica/api/page/SupportSelect";
        var proxy = await this.getProxy();

        var options = {
            method: "POST",
            uri: url,
            proxy: proxy,
            gzip: true,
            headers: {
                "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; SAMSUNG-SM-N900A Build/KOT49H) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Crosswalk/23.53.589.4 Safari/537.36",
                "content-Type": "application/json",
                "user-id-fba9x88mae": userid,
                "f4s-client-ver": "3",
            },
            body: JSON.stringify({
                strUserIds: idString
            })
        };
        var result = await this.repeatQuery(options, 4);
        //console.log(result);
        return result;
    }

    parseFriends(data) {
        console.log(data);
        data = JSON.parse(data);
        if (data == undefined) {
            return undefined;
        }
        if ("resultCode" in data){
            console.log(`ERROR: The query failed: ${data.resultCode}`);
            return undefined;
        }
        if (data.hits.total <= 0) {
            console.log("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return undefined;
        }

        var results = [];

        for (const hit of data.hits.hits) {
            var result = {id: hit.fields["id"][0], inviteCode: hit.fields["inviteCode"][0]};
            results.push(result);
        }

        console.log(results);
        return results;
    }

    async parseSupports(data) {
        //console.log(data);
        data = JSON.parse(data);
        if (data == undefined) {
            return undefined;
        }
        if ("interrupt" in data || !("supportUserList" in data)) {
            console.log(`ERROR: The query failed: ${JSON.stringify(data)}`);
            return;
        }
        if (data.supportUserList.length == 0) {
            console.log("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return;
        }

        var allMemes = [];
        var memes = [];
        var allGirls = [];
        var doppelIds = [];
        var doppelGirlNames = [];

        var userIds = [];

        var user = new MagiRecoUser();
        for (var supportUserIndex in data.supportUserList) {
            memes = [];
            doppelIds = [];
            doppelGirlNames = [];

            var supportUser = data.supportUserList[supportUserIndex];

            userIds.push(supportUser.userId);

            var user = await entityManager.getRepository(MagiRecoUser).findOne({user_id: supportUser.userId});
            if (user == undefined) {
                user = new MagiRecoUser();
                user.addtimestamp = new Date().toUTCString();
            }
            user.user_id = supportUser.userId;
            user.friend_id = supportUser.inviteCode;
            user.display_name = supportUser.userName;
            user.user_rank = supportUser.userRank;
            user.class_rank = supportUser.definitiveClassRank;
            user.last_access = supportUser.lastAccessDate;
            user.comment = supportUser.comment;
            user.updatetimestamp = new Date().toUTCString();
            user = await entityManager.save(user);

            user = await entityManager.getRepository(MagiRecoUser).findOne({where: {user_id: supportUser.userId}, relations: ["meguca"]});
            var savedGirls = user.meguca;
            for (var girl in savedGirls) {
                await typeorm.getConnection().createQueryBuilder()
                    .delete()
                    .from(Memoria)
                    .where("megucaId = :meguca", {meguca: savedGirls[girl].id})
                    .execute();
                await entityManager.remove(savedGirls[girl]);
            }

            if (!("userDoppelList" in supportUser) || supportUser.userDoppelList.length == 0) {
                // No Doppels
            }
            else {
                for (var index in supportUser.userDoppelList) {
                    var doppelData = supportUser.userDoppelList[index];
                    doppelIds.push(doppelData.doppelId);
                }
            }

            let titleDict = {};

            if (!("userCharaList" in supportUser) || supportUser.userCharaList.length == 0) {
                // No Characters - something probably isn't right
            }
            else {
                for (var index in supportUser.userCharaList) {
                    var characterData = supportUser.userCharaList[index];
                    //if (supportUser.inviteCode == "Q69KBCAA") console.log(characterData);//396utQVZ
                    if (!("chara" in characterData) || characterData.chara == undefined ||
                        !("doppel" in characterData.chara) || characterData.chara.doppel == undefined ||
                        !("id" in characterData.chara.doppel) || 
                        characterData.chara.doppel.id == undefined ||
                        !("name" in characterData.chara) || characterData.chara.name == undefined) {
                            continue;
                    }

                    let title = characterData.chara.title;
                    if (title) {
                        titleDict[characterData.chara.id] = title;
                    }

                    if (doppelIds.includes(characterData.chara.doppel.id)) {
                        doppelGirlNames.push({name: characterData.chara.name, title: title});
                    }
                }
            }

            if (!("userPieceList" in supportUser) || supportUser.userPieceList.length == 0) {
                // No Memoria
            }
            else {
                for (var memeIndex in supportUser.userPieceList) {
                    var memeData = supportUser.userPieceList[memeIndex];
                    var memeName = memeData.piece.pieceName;

                    var masterMeme = await entityManager.getRepository(MasterMemoria).findOne({jpn_name: memeName});
                    if (masterMeme == null) {
                        masterMeme = new MasterMemoria();
                        masterMeme.jpn_name = memeName;
                        if (memeData.piece.pieceType == "SKILL") {
                            masterMeme.active = false;
                        }
                        else {
                            masterMeme.active = true;
                        }

                        masterMeme.rating = parseInt(memeData.piece.rank.replace("RANK_", ""));

                        masterMeme = await entityManager.save(masterMeme);
                    }

                    var meme = new Memoria();
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

            if (!("userCardList" in supportUser) || supportUser.userCardList.length == 0) {
                // No Supports
            }
            else {
                for (var megucaIndex in supportUser.userCardList) {
                    var supportMeguca = supportUser.userCardList[megucaIndex];
                    var girlName = supportMeguca.card.cardName;
                    var mainGirlName = girlName;
                    var title = titleDict[supportMeguca.card.charaNo];
                    //console.log(title);
                    if (title) girlName = `${girlName} (${title})`;
                    //console.log(girlName);

                    var masterMeguca = await entityManager.getRepository(MasterMeguca).findOne({jpn_name: girlName});
                    if (masterMeguca == null) {
                        var girlAtt = supportMeguca.card.attributeId;

                        var attributes = ["VOID","FIRE","WATER", "TIMBER", "LIGHT", "DARK"];
                        var attributeVal = attributes.indexOf(girlAtt);

                        if (attributeVal != -1) attributeVal++;

                        masterMeguca = new MasterMeguca();
                        masterMeguca.jpn_name = girlName;
                        masterMeguca.meguca_type= attributeVal;

                        masterMeguca = await entityManager.save(masterMeguca);
                    }

                    var meguca = new Meguca();
                    meguca.masterMeguca = masterMeguca;
                    var positionIdNum = parseInt(megucaIndex) + 1;
                    var positionId = "questPositionId" + positionIdNum;
                    meguca.support_type = parseInt(supportUser.userDeck[positionId]);
                    meguca.level = parseInt(supportMeguca.level);
                    meguca.magia_level = parseInt(supportMeguca.magiaLevel);
                    meguca.revision = parseInt(supportMeguca.revision);
                    meguca.attack = parseInt(supportMeguca.attack);
                    meguca.defense = parseInt(supportMeguca.defense);
                    meguca.hp = parseInt(supportMeguca.hp);
                    meguca.user = user;

                    if (doppelGirlNames.filter(value => value.name == mainGirlName && value.title == title).length > 0) {
                        meguca.magia_level = 6;
                    }

                    var slots = meguca.revision + 1;
                    for (var i = 1; i <= slots; i++) {
                        var field = "userPieceId0" + positionIdNum + i;
                        if (!(field in supportUser.userDeck) || supportUser.userDeck[field] == undefined) {
                            slots--;
                            continue;
                        }

                        var memeId = supportUser.userDeck[field];
                        var meme = memes.find(function(element) {
                            return element.memoriaId == memeId;
                        });
                        if (meme != undefined) {
                            meguca.hp += meme.hp;
                            meguca.attack += meme.attack;
                            meguca.defense += meme.defense;
                            delete meme.hp;
                            delete meme.attack;
                            delete meme.defense;
                            meme.meguca = meguca;
                            delete meme.memoriaId;
                            allMemes.push(meme);
                        }
                        else slots--;
                    }

                    meguca.slots = slots;

                    allGirls.push(meguca);
                }
            }
        }

        await entityManager.save(allGirls);
        await entityManager.save(allMemes);

        var users = [];
        for (var userIdIndex in userIds) {
            var userId = userIds[userIdIndex];
            user = await entityManager.getRepository(MagiRecoUser).findOne({user_id: userId});
            users.push(user);
        }
        console.log(`Parsed ${users.length} user accounts`);
        Util.log_general(`Parsed ${users.length} user accounts`, this.bot);
        return users;
    }


}

