const BaseCommand = require('../BaseCommand.js');
const path = require('path');
const fs = require('fs');
const typeorm = require('typeorm');
const entityManager = typeorm.getManager();
const MagiRecoUser = require('../model/MagiRecoUser').MagiRecoUser;
const MasterMeguca = require('../model/MasterMeguca').MasterMeguca;
const Meguca = require('../model/Meguca').Meguca;
const MasterMemoria = require('../model/MasterMemoria').MasterMemoria;
const Memoria = require('../model/Memoria').Memoria;



module.exports = class Parse extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {
        let friendDataPath = path.normalize(`${this._basePath}/data/friendsearch.json`);
        this.data = (fs.existsSync(friendDataPath) && JSON.parse(fs.readFileSync(friendDataPath))) || {};

        if ("resultCode" in this.data){
            message.channel.send(`ERROR: The query failed: ${this.data.resultCode}`);
            return;
        }
        if (this.data.hits.total <= 0) {
            message.channel.send("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return;
        }

        // Get user_id // id from friendSearchData
        // and send request to Supports with user_id


        message.channel.send(JSON.stringify(this.data));


        let supportsPath = path.normalize(`${this._basePath}/data/supports.json`);
        this.supportsData = (fs.existsSync(friendDataPath) && JSON.parse(fs.readFileSync(supportsPath))) || {};

        if ("interrupt" in this.supportsData || !("supportUserList" in this.supportsData)) {
            message.channel.send(`ERROR: The query failed: ${JSON.stringify(this.supportsData)}`);
            return;
        }
        if (this.supportsData.supportUserList.length == 0) {
            message.channel.send("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return;
        }

        var allMemes = [];
        var memes = [];
        var allGirls = [];

        var userIds = [];

        var user = new MagiRecoUser();
        for (var supportUserIndex in this.supportsData.supportUserList) {
            memes = [];

            var supportUser = this.supportsData.supportUserList[supportUserIndex];

            userIds.push(supportUser.userId);

            var user = await entityManager.getRepository(MagiRecoUser).findOne({user_id: supportUser.userId});
            if (user == undefined) user = new MagiRecoUser();
            user.user_id = supportUser.userId;
            user.friend_id = supportUser.inviteCode;
            user.display_name = supportUser.userName;
            user.user_rank = supportUser.userRank;
            user.class_rank = supportUser.definitiveClassRank;
            user.last_access = supportUser.lastAccessDate;
            user.comment = supportUser.comment;
            user.addtimestamp = new Date();
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

                    for (var i = 1; i <= meguca.revision + 1; i++) {
                        var field = "userPieceId0" + positionIdNum + i;
                        if (!(field in supportUser.userDeck) || supportUser.userDeck[field] == undefined) {
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
                    }

                    allGirls.push(meguca);
                }
            }
        }

        await entityManager.save(allGirls);
        await entityManager.save(allMemes);

        var users = [];
        for (var userIdIndex in userIds) {
            var userId = userIds[userIdIndex];
            user = await entityManager.getRepository(MagiRecoUser).findOne({user_id: userId, relations: ["meguca"]});
            users.push(user);
        }

        //console.log(users);
        //message.channel.send(JSON.stringify(users));

        return;
    }

}

