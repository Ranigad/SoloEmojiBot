const BaseCommand = require('../BaseCommand.js');
const rp = require('request-promise');

module.exports = class Update extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {

        bot.supportsManager.testQueries();
        // var options = {
        //     method: "GET",
        //     uri: "https://rice.qyu.be/cgi-bin/pixiedust.sh",
        // };
        // var proxy = await rp(options);
        // console.log(proxy);

        // options = {
        //     method: "GET",
        //     uri: "https://rice.qyu.be/cgi-bin/pixiedust.sh",
        //     proxy: "http://" + proxy,
        // };
        // var proxy2 = await rp(options);
        // console.log(proxy2);


        return;
    }

}

