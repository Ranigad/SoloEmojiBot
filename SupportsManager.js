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


module.exports = class SupportsManager {
    constructor() {
        this.loadingInvites = []; // Invites currently loading from friend-search
        this.loadingIds = []; // Ids currently loading from support query
        this.callbacks = [];
    }

    testFriendsParsing() {
        var friendDataPath = path.normalize(`./data/friendsearch.json`);
        var data = (fs.existsSync(friendDataPath) && JSON.parse(fs.readFileSync(friendDataPath))) || {};
        this.parseFriends(data);
    }

    testSupportsParsing() {
        var supportsPath = path.normalize(`./data/supports.json`);
        var data = (fs.existsSync(supportsPath) && JSON.parse(fs.readFileSync(supportsPath))) || {};
        this.parseSupports(data);
    }

    async fetchUserWithInvite(inviteCodeRequest) {
        var inviteCode = inviteCodeRequest.inviteCode;
        var callback = inviteCodeRequest.callback;

        this.callbacks.push(inviteCodeRequest);

        if (this.loadingInvites.includes(inviteCode)) {
            return;
        }
        else {
            this.loadingInvites.push(inviteCode);
        }

        // TODO Send query with inviteCode to get id
        //var data = friendSearch(inviteCode);
        var id = undefined;
        //var id = parseFriends(data);

        if (id == undefined) {
            for (const callback of this.callbacks) {
                if (callback.inviteCode == inviteCode) {
                    callbacks.remove(callback);
                    callback(false);
                }
            }
        }

        fetchUserWithId(id);
    }

    async fetchUserWithId(idRequest) {
        var id = idRequest.id;
        var callback = idRequest.callback;

        if (callback != undefined) {
            this.callbacks.push(idRequest);
        }

        if (this.loadingIds.includes(id)) {
            return;
        }
        else {
            this.loadingIds.push(id);
        }

        var ids = [id];

        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        const users = entityManager.createQueryBuilder("MagiRecoUser")
            .where("MagiRecoUser.updatetimestamp < :date", {date: yesterday})
            .getMany();

        for (user of users) {
            if (ids.length == 15) {
                break;
            }
            if (this.loadingIds.includes(user.user_id)) {
                continue;
            }
            else {
                this.loadingIds.push(user.user_id);
                ids.push(user.user_id);
            }
        }

        // TODO Send query with combined 15 ids to get data
        var idString = ids.join();
        //var data = supportSearch(idString);
        //var users = parseSupports(data);

        // TODO Handle callbacks
    }

    parseFriends(data) {
        console.log(data);
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
            var result = {invite: hit.fields["inviteCode"], id: hit.fields["id"]};
            results.push(result);
        }

        console.log(results);
        return results;
    }

    async parseSupports(data) {
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

            if (!("userCharaList" in supportUser) || supportUser.userCharaList.length == 0) {
                // No Characters - something probably isn't right
            }
            else {
                for (var index in supportUser.userCharaList) {
                    var characterData = supportUser.userCharaList[index];
                    if (!("chara" in characterData) || characterData.chara == undefined ||
                        !("doppel" in characterData.chara) || characterData.chara.doppel == undefined ||
                        !("id" in characterData.chara.doppel) || 
                        characterData.chara.doppel.id == undefined ||
                        !("name" in characterData.chara) || characterData.chara.name == undefined) {
                            continue;
                    }

                    if (doppelIds.includes(characterData.chara.doppel.id)) {
                        doppelGirlNames.push(characterData.chara.name);
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
                    if (memeData.lbCount == 4) {
                        meme.mlb = true;
                    }
                    else {
                        meme.mlb = false;
                    }
                    meme.level = memeData.level;
                    meme.memoriaId = memeData.id;

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

                    if (doppelGirlNames.includes(girlName)) {
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
        return users;
    }


}

