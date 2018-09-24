const BaseCommand = require('../BaseCommand.js');
const path = require('path');
const fs = require('fs');
const MagiRecoUser = require('../model/MagiRecoUser').MagiRecoUser;

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
            users.push(user);
            user = new MagiRecoUser();
        }

        console.log(users);
        message.channel.send(JSON.stringify(users));

        return;
    }

}

