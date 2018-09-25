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
        console.log(this.data);

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
        //console.log(this.supportsData);

        if ("interrupt" in this.supportsData || !("supportUserList" in this.supportsData)) {
            message.channel.send(`ERROR: The query failed: ${JSON.stringify(this.supportsData)}`);
            return;
        }
        if (this.supportsData.supportUserList.length == 0) {
            message.channel.send("No results");
            // Check if current data, notify users if nothing (typo suspected)
            return;
        }

        var users = [];
        var user = new MagiRecoUser();
        for (var supportUserIndex in this.supportsData.supportUserList) {
            var supportUser = this.supportsData.supportUserList[supportUserIndex];
            console.log(supportUser);
            user.user_id = supportUser.userId;
            user.friend_id = supportUser.inviteCode;
            user.display_name = supportUser.userName;
            user.user_rank = supportUser.userRank;
            user.class_rank = supportUser.definitiveClassRank;
            user.last_access = supportUser.lastAccessDate;
            user.comment = supportUser.comment;

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

                    console.log(meme);
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
                        //entityManager.save(masterMeguca);
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
                    //console.log(meguca);

                }
            }


            users.push(user);
            user = new MagiRecoUser();
        }

        //console.log(users);
        message.channel.send(JSON.stringify(users));

        return;
    }

}

