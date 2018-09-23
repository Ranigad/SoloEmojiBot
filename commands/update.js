const BaseCommand = require('../BaseCommand.js');
const rp = require('request-promise');

module.exports = class React extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {
        var query_string = "inviteCode: Q68KBCAA~ OR inviteCode: RQ1WSexF OR inviteCode: R6cBkrMH";

        var url = "https://rice.qyu.be/search/friend_search/_search";

        /** Friend Search - General Player Information */
        // var options = {
        //     method: "POST",
        //     uri: url,
        //     gzip: true,
        //     headers: {
        //         "content-Type": "application/json",
        //         "user-id-fba9x88mae": "8badf00d-dead-4444-beef-deadbeefcafe",
        //         "charset": "UTF-16",
        //     },
        //     body: JSON.stringify({
        //         query: {
        //             query_string: {
        //                 query: query_string,
        //                 lenient: true,
        //             },
        //         },
        //         stored_fields: "*",
        //         size: 50,
        //     })
        // };
        // var result = await rp(options);
        // console.log(result);
        // return message.channel.send(result);

        /** Support Select - Support Data */
        const userid = process.env.USER_ID;
        url = "https://android.magi-reco.com/magica/api/page/SupportSelect";
        var options2 = {
            method: "POST",
            uri: url,
            gzip: true,
            headers: {
                "content-Type": "application/json",
                "user-id-fba9x88mae": userid,
                "f4s-client-ver": "1.5.6",
            },
            body: JSON.stringify({
                strUserIds: "b6d1c78a-1ff5-11e8-b76c-0612dec7c570,9fedd82c-a44a-11e8-8997-06384dc95a86"
            })
        };
        var result = await rp(options2);
        console.log(result);
        return;




    }

}

