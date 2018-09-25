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
                    meguca.level = supportMeguca.level;
                    meguca.magia_level = supportMeguca.magia_level + "";
                    meguca.revision = supportMeguca.revision;
                    console.log(meguca);

                }
            }


            users.push(user);
            user = new MagiRecoUser();
        }

        console.log(users);
        message.channel.send(JSON.stringify(users));

        return;
    }

}

