const BaseCommand = require('../BaseCommand.js');
const noodle = require('noodlejs');
const rp = require('request-promise');

// Event Timer: https://rice.qyu.be/lua-bin/event_timer.lua?msg=en

module.exports = class React extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {
        var url = "https://rice.qyu.be/lua-bin/event_timer.lua?msg=en";
        var brief_url = url.slice(8);
        var query = [
            {
                url: url,
                selector: '#el_d1',
                type: 'html',
                extract: 'text',
                cache: 'false'
            },
            {
                url: url,
                selector: '#el_h1',
                type: 'html',
                extract: 'text',
                cache: 'false'
            },
            {
                url: url,
                selector: '#el_m1',
                type: 'html',
                extract: 'text',
                cache: 'false'
            },
            {
                url: url,
                selector: '#el_s1',
                type: 'html',
                extract: 'text',
                cache: 'false'
            }
        ];

        var options = {
            method: "GET",
            uri: url,
            resolveWithFullResponse: true
        };
        var result = await rp(options);


        var event_title_data = await noodle.query({url: "https://magireco.wikia.com/wiki/We_Passed_the_First_of_That_Day", 
            type: 'html', selector: '#PageHeader div.page-header__main h1.page-header__title', 
            extract: 'text', "cache": "false"});
        //console.log(event_title_data);
        var event_name = event_title_data.results[0].results[0];
        console.log(event_name);

        var data = await noodle.query(query);
        //console.log(data);
        var cd_days = data.results[0].results[0];
        var cd_hours = data.results[1].results[0];
        var cd_minutes = data.results[2].results[0];
        var cd_seconds = data.results[3].results[0];
        var countdown_time = `${cd_days} days, ${cd_hours} hours, and ${cd_minutes} minutes`;

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        var redirected_href = result.request.uri.href;
        var date_regex = /iso=.+/g;
        var date_retrieved = redirected_href.match(date_regex)[0];

        // Slice does not include end index
        var date_year = date_retrieved.slice(4,8);
        var date_month = date_retrieved.slice(8,10);
        var date_month_val = parseInt(date_month);
        var month = null;
        if (date_month_val < 1 || date_month_val > 13){
            month = date_month_val;
        }
        else {
            month = months[date_month_val - 1];
        }
        var date_day = date_retrieved.slice(10,12);
        var date_day_val = parseInt(date_day);
        var date_hour = date_retrieved.slice(13,15);
        var date_minute = date_retrieved.slice(15,17);
        var date_second = date_retrieved.slice(17,19);

        var full_date = `${month} ${date_day_val}, ${date_year} ${date_hour}:${date_minute}:${date_second}`;

        //console.log(result.request.uri.href);
        //console.log(date_retrieved);
        //console.log(full_date + "Ends in: " + countdown_time);

        var reply = `**Event**: ${event_name} (https://magireco.wikia.com/wiki/Current_Event)
**Event Drops**: .eventdrops
**Ends in**: ${countdown_time} (*${full_date} JST*)
**Countdown**: ${brief_url}`;
        return message.channel.send(reply);
    }

}


