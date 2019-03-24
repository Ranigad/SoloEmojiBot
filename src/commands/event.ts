import {BaseCommand} from "../BaseCommand";
const noodle = require('noodlejs');
const rp = require('request-promise');

// Event Timer: https://rice.qyu.be/lua-bin/event_timer.lua?msg=en

export class EventCommand extends BaseCommand {
    constructor(debug=false) {
        super(debug);
    }

    handler(...args) {
        let [wiki, bot, message, cmdargs] = args;

        this.run(bot, message, cmdargs);
    }

    async run(bot, message, cmdargs) {
        let url = "https://rice.qyu.be/lua-bin/event_timer.lua?msg=en";
        let brief_url = url.slice(8);
        let query = [
            {
                url: url,
                selector: '#el_d1',
                type: 'html',
                extract: 'text',
                cache: false
            },
            {
                url: url,
                selector: '#el_h1',
                type: 'html',
                extract: 'text',
                cache: false
            },
            {
                url: url,
                selector: '#el_m1',
                type: 'html',
                extract: 'text',
                cache: false
            },
            {
                url: url,
                selector: '#el_s1',
                type: 'html',
                extract: 'text',
                cache: false
            }
        ];

        let options = {
            method: "GET",
            uri: url,
            resolveWithFullResponse: true
        };
        let result = await rp(options);
        console.log(result);

        let general_event_url = "https://magireco.wikia.com/wiki/Current_Event";
        let event_title_data = await noodle.query({url: general_event_url, 
            type: 'html', selector: '#PageHeader div.page-header__main h1.page-header__title', 
            extract: 'text', "cache": false});
        let event_name = event_title_data.results[0].results[0];
        if (event_name == undefined) event_name = "Current_Event";
        let url_end = event_name.replace(/ /g, '_');
        let event_url = general_event_url.replace("Current_Event", url_end);

        let data = await noodle.query(query);
        let cd_days = data.results[0].results[0];
        let cd_hours = data.results[1].results[0];
        let cd_minutes = data.results[2].results[0];
        let cd_seconds = data.results[3].results[0];
        let countdown_time = `${cd_days} days, ${cd_hours} hours, and ${cd_minutes} minutes`;

        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        let redirected_href = result.request.uri.href;
        let date_regex = /iso=.+/g;
        let date_retrieved = redirected_href.match(date_regex)[0];

        // Slice does not include end index
        let date_year = date_retrieved.slice(4,8);
        let date_month = date_retrieved.slice(8,10);
        let date_month_val = parseInt(date_month);
        let month = null;
        if (date_month_val < 1 || date_month_val > 13){
            month = date_month_val;
        }
        else {
            month = months[date_month_val - 1];
        }
        let date_day = date_retrieved.slice(10,12);
        let date_day_val = parseInt(date_day);
        let date_hour = date_retrieved.slice(13,15);
        let date_minute = date_retrieved.slice(15,17);
        let date_second = date_retrieved.slice(17,19);

        let full_date = `${month} ${date_day_val}, ${date_year} ${date_hour}:${date_minute}:${date_second}`;

        let reply = `**Event**: ${event_name} (${event_url})
Use **.eventdrops** to see event farming information.
**Ends in**: ${countdown_time} (*${full_date} JST*)`;
        return message.channel.send(reply);
    }

}

